import { spawnSync } from "child_process";

export function requestSync(url: string) {
    const output = {
        statusCode: -1,
        data: "",
    }
    const child = spawnSync(`
        try {
            $response = Invoke-RestMethod -Uri "${url.replace(/"/g, "'")}" -UserAgent "cpp-httplib/0.7"
            echo $response
        } catch {
            $StatusCode = [int]$_.Exception.Response.StatusCode
            throw "$([int]$StatusCode)"
        }`,
        [], { shell: "powershell.exe" });
    const err = child.stderr.toString();
    if (err) {
        output.statusCode = parseInt(err) || 400;
    } else {
        output.statusCode = 200;
    }
    output.data = child.stdout.toString();
    return output;
}