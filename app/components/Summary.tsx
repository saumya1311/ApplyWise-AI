import ScoreGauge from "./ScoreGauge"
import ScoreBadge from "./ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600'
        : score > 49
            ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="resume-summary !p-1">
            <div className="category !p-2">
                <div className="flex flex-row gap-2 items-center justify-center text-black dark:text-black">
                    <p className="text-lg font-semibold">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-lg font-semibold">
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    if (!feedback) return null;
    return (
        <div className="bg-white rounded-2xl shadow-md w-full">
            <div className="flex flex-row items-center p-4 gap-8">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-extrabold dark:text-white" style={{ fontWeight: 800 }}>Your Resume Score</h2>
                    <p className="text-sm text-gray-500 font-semibold">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />
        </div>
    )
}

export default Summary