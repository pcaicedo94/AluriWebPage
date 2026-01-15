# Git Push with Alarm Script
# Usage: .\git-push-with-alarm.ps1 "Your commit message"

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Update"
)

Write-Host "Adding files to git..." -ForegroundColor Cyan
git add .

Write-Host "Committing with message: $CommitMessage" -ForegroundColor Cyan
git commit -m $CommitMessage

Write-Host "Pushing to remote..." -ForegroundColor Cyan
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful! Waiting 30 seconds before alarm..." -ForegroundColor Green
    Start-Sleep -Seconds 30
    
    Write-Host "`n=== ALARM! 30 seconds have passed since git push ===" -ForegroundColor Yellow -BackgroundColor Red
    
    # Play system beep multiple times
    for ($i = 1; $i -le 5; $i++) {
        [Console]::Beep(800, 500)
        Start-Sleep -Milliseconds 200
    }
    
    Write-Host "Alarm completed!" -ForegroundColor Green
} else {
    Write-Host "Push failed. No alarm will be triggered." -ForegroundColor Red
}
