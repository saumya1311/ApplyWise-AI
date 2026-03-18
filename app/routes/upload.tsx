import { type FormEvent, useState, useEffect } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import Footer from "~/components/Footer";
import { Link } from 'react-router';

import { supabase } from "~/lib/supabase";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) navigate('/auth?next=/upload');
        };
        checkAuth();
    }, [navigate]);
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);

        const uuid = generateUUID();

        setStatusText('Uploading the file...');
        const { data: uploadFile, error: fileError } = await supabase.storage
            .from('resumes')
            .upload(`${uuid}/${file.name}`, file, { cacheControl: '3600', upsert: false });

        if (fileError) return setStatusText(`Error: Failed to upload file - ${fileError.message}`);

        const { data: { publicUrl: pdfUrl } } = supabase.storage.from('resumes').getPublicUrl(`${uuid}/${file.name}`);

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) {
            console.error(imageFile.error);
            return setStatusText(imageFile.error ?? "PDF conversion failed");
        }

        setStatusText('Uploading the image...');
        const { data: uploadImage, error: imgError } = await supabase.storage
            .from('resumes')
            .upload(`${uuid}/${imageFile.file.name}`, imageFile.file, { cacheControl: '3600', upsert: false });

        if (imgError) return setStatusText(`Error: Failed to upload image - ${imgError.message}`);

        const { data: { publicUrl: imageUrl } } = supabase.storage.from('resumes').getPublicUrl(`${uuid}/${imageFile.file.name}`);

        setStatusText('Analyzing with AI...');

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle, jobDescription, pdfUrl })
            });

            if (!res.ok) throw new Error('Failed to analyze resume');
            const result = await res.json();

            if (result.error) throw new Error(result.error);

            setStatusText('Saving data...');
            const { data: { session } } = await supabase.auth.getSession();
            const data = {
                id: uuid,
                user_id: session?.user.id,
                resumePath: pdfUrl,
                imagePath: imageUrl,
                companyName,
                jobTitle,
                jobDescription,
                feedback: result.feedback,
            }

            const { error: dbError } = await supabase.from('resumes').insert(data);
            if (dbError) throw dbError;

            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${uuid}`);
        } catch (error: any) {
            console.error(error);
            setStatusText(`Error: ${error.message}`);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[#d9ecfe] min-h-screen pt-0">
            <Navbar />

            <section className="main-section px-2 sm:px-10">
                <div className="page-heading  max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-[#33334d] dark:text-white mb-2">
                        Smart feedback for your <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#a5b4fc] to-[#60a5fa] dark:from-[#818cf8] dark:to-[#22d3ee]">dream job</span>
                    </h1>
                    {isProcessing && (
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-xl text-gray-500 dark:text-gray-400 font-medium">{statusText}</h2>
                            <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
                                <img src="/images/resume-scan.gif" className="w-full h-auto" alt="Processing..." />
                            </div>
                        </div>
                    )}

                    {!isProcessing && (
                        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-white p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black">
                            <Link to="/" className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-600 transition-colors self-start uppercase tracking-wider mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </Link>
                            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="form-div">
                                        <label htmlFor="company-name" className="text-sm font-bold mb-2">Company Name</label>
                                        <input type="text" name="company-name" placeholder="e.g. Google" id="company-name" className="w-full" />
                                    </div>
                                    <div className="form-div">
                                        <label htmlFor="job-title" className="text-sm font-bold mb-2">Job Title</label>
                                        <input type="text" name="job-title" placeholder="e.g. Frontend Engineer" id="job-title" className="w-full" />
                                    </div>
                                </div>

                                <div className="form-div text-left">
                                    <label htmlFor="job-description" className="text-sm font-bold mb-2">Job Description</label>
                                    <textarea rows={2} name="job-description" placeholder="Paste the job requirements here..." id="job-description" className="w-full" />
                                </div>

                                <div className="form-div text-left">
                                    <label htmlFor="uploader" className="text-sm font-bold mb-2">Upload Resume (PDF)</label>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </div>

                                <button className="primary-button text-lg font-bold py-4 shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/20 transition-all duration-300" type="submit">
                                    Analyze Resume
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    )
}
export default Upload
