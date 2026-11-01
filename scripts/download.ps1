param([string]$Url, [string]$Output)
$ErrorActionPreference = 'Stop'
Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30 -OutFile $Output
