import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    })

    const file = acceptedFiles[0] || null;



    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`relative p-1 text-center transition-all duration-500 cursor-pointer rounded-[32px] border-2 border-dashed 
                    ${isDragActive
                        ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]'
                        : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 hover:bg-white dark:hover:bg-gray-800/50'}`}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-4">
                    {file ? (
                        <div className="w-full flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileSelect?.(null);
                                }}
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-[#33334d] dark:text-gray-200">
                                    Click to upload <span className="text-indigo-500 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">
                                        or drag and drop
                                    </span>
                                </p>
                                <p className="text-sm font-medium text-gray-400 mt-2">
                                    Maximum file size: <span className="text-black dark:text-gray-300">{formatSize(maxFileSize)}</span> • PDF only
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileUploader