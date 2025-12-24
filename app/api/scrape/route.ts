import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // Define scraping methods
        const methods = [
            {
                name: 'Method 2 (Instaloader Python Wrapper)',
                fn: async () => await runPythonWrapper('method2_wrapper.py', username),
            },
            // Validation for Method 4 can be added here
        ];

        let lastError = '';

        for (const method of methods) {
            console.log(`Attempting ${method.name}...`);
            try {
                const result = await method.fn();
                if (result.success) {
                    return NextResponse.json({
                        success: true,
                        method: method.name,
                        followers: result.followers,
                    });
                } else {
                    lastError = result.error || 'Unknown error';
                    console.warn(`${method.name} failed: ${lastError}`);
                    // Continue to next method
                }
            } catch (e: any) {
                lastError = e.message;
                console.error(`${method.name} exception: ${e.message}`);
            }
        }

        return NextResponse.json(
            { error: `All methods failed. Last error: ${lastError}` },
            { status: 500 }
        );
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

async function runPythonWrapper(scriptName: string, username: string) {
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);

    // Ensure we use the python environment where instaloader is installed.
    // We assume 'python' is in path and has instaloader. 
    // If pip installed to a user dir (like indicated in logs), we might strictly need that python.
    // The logs showed: "WARNING: The script instaloader.exe is installed in 'C:\Users\motas\AppData\Roaming\Python\Python312\Scripts'"
    // We should try 'python' first.

    const command = `python "${scriptPath}" "${username}"`;

    try {
        const { stdout, stderr } = await execAsync(command);

        if (stderr && stderr.trim().length > 0) {
            // Instaloader prints info to stderr sometimes, not always fatal.
            // We rely on stdout being JSON.
            console.log('Wrapper Stderr:', stderr);
        }

        try {
            const data = JSON.parse(stdout.trim());
            return data;
        } catch (parseErr) {
            return { success: false, error: `Failed to parse Python output: ${stdout}` };
        }
    } catch (execErr: any) {
        return { success: false, error: `Execution failed: ${execErr.message}` };
    }
}
