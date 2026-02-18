export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-neutral-950 text-white">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
            <p className="mb-4 text-center max-w-md text-neutral-400">
                There was an error authenticating your request. This could be due to a timeout or an invalid link.
            </p>
            <a
                href="/"
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition font-semibold"
            >
                Return to Home
            </a>
        </div>
    );
}
