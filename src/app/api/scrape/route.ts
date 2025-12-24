import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (selectedMethod === 'method6') {
            // Method 6 (InstaTouch)
            methods.push({
                name: 'Method 6 (InstaTouch)',
                fn: async () => await runPythonWrapper('method6_wrapper.js', username, scrapflyKey, sessionId, true), // Passing JS true
            });
        }
        else if (selectedMethod === 'method5') {
            // Method 5 (ScrapFly)
            methods.push({
                name: 'Method 5 (ScrapFly)',
                fn: async () => await runPythonWrapper('method5_wrapper.py', username, scrapflyKey),
            });
        }
        else {
            // Method 2 (Instaloader)
            methods.push({
                name: 'Method 2 (Instaloader w/ Session)',
                fn: async () => await runPythonWrapper('method2_wrapper.py', username, sessionId),
            });
        }

        const errors: string[] = [];

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
                    const msg = result.error || 'Unknown error';
                    console.warn(`${method.name} failed: ${msg}`);
                    errors.push(`${method.name}: ${msg}`);
                    // Continue to next method
                }
            } catch (e: any) {
                console.error(`${method.name} exception: ${e.message}`);
                errors.push(`${method.name} exception: ${e.message}`);
            }
        }

        return NextResponse.json(
            { error: `All methods failed. Details: ${errors.join(' | ')}` },
            { status: 500 }
        );
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

async function runPythonWrapper(scriptName: string, username: string, key?: string, sessionId?: string, isNode: boolean = false) {
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);

    let command = '';

    if (isNode) {
        // Node execution for Method 6
        // Args: script path, username, sessionid
        const safeSession = sessionId || '';
        command = `node "${scriptPath}" "${username}" "${safeSession}"`;
    } else {
        // Python execution
        // Args depend on the script
        if (scriptName.includes('method5')) {
            command = `python "${scriptPath}" "${username}" "${key}"`;
        } else {
            // Method 2: username, sessionId (optional)
            const safeSession = sessionId || key || ''; # key passed as session in some fallbacks, but here be explicit
            if (safeSession) {
                command = `python "${scriptPath}" "${username}" "${safeSession}"`;
            } else {
                command = `python "${scriptPath}" "${username}"`;
            }
        }
    }

    try {
        const { stdout, stderr } = await execAsync(command);

        if (stderr && stderr.trim().length > 0) {
            console.log('Wrapper Stderr:', stderr);
        }

        try {
            const data = JSON.parse(stdout.trim());
            return data;
        } catch (parseErr) {
            return { success: false, error: `Failed to parse output: ${stdout}` };
        }
    } catch (execErr: any) {
        return { success: false, error: `Execution failed: ${execErr.message}` };
    }
}
