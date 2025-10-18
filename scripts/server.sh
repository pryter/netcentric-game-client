#!/bin/bash

# Create server directory
mkdir -p ./server

# GitHub repository details
REPO="pryter/netcentric-game-server"
GITHUB="https://api.github.com"
VERSION="latest"

# Detect OS
case "$(uname -s)" in
    Darwin) os="macos" ;;
    Linux) os="linux" ;;
    MINGW*|MSYS*|CYGWIN*|Windows_NT) os="windows" ;;
    *) echo "Operating system not supported"; exit 1 ;;
esac

# Detect architecture
case "$(uname -m)" in
    i386|i686) architecture="386" ;;
    x86_64) architecture="amd64" ;;
    armv7l|armv8l|arm) architecture="arm" ;;
    aarch64|arm64) architecture="arm64" ;;
    *) echo "Architecture not supported"; exit 1 ;;
esac

target="${os}-${architecture}"
echo "Detected system: $target"

# Fetch latest release info (public API, no auth)
release_json=$(curl -s -S "$GITHUB/repos/$REPO/releases/latest" 2>/dev/null)

# Extract version tag and asset URL for this target
version_tag=$(echo "$release_json" | grep '"tag_name":' | cut -d '"' -f 4)
asset_url=$(echo "$release_json" | grep "browser_download_url" | grep "$target" | grep ".tar.gz" | grep -v ".md5" | cut -d '"' -f 4)

if [[ -z "$asset_url" ]]; then
  echo "No matching release asset found for $target"
  exit 1
fi

echo "Found release tag: $version_tag"

# Skip download if up-to-date
version_file="./server/version.txt"
if [[ -f ./server/wsserver && -f "$version_file" ]]; then
  current_version=$(<"$version_file")
  if [[ "$current_version" == "$version_tag" ]]; then
    echo "Binary already exists and is up to date. Skipping download."
    ./server/wsserver
    exit 0
  fi
fi

echo "Downloading from: $asset_url"
# Download and extract
curl -L -o ./server/artifact.tar.gz "$asset_url"

echo "Extracting artifact..."
cd ./server || exit 1
tar -xzf artifact.tar.gz

if [[ $? -eq 0 ]]; then
  echo "$version_tag" > version.txt
  rm -f artifact.tar.gz
  echo "Extraction complete."
  chmod +x wsserver
  clear
  ./wsserver
  exit 0
else
  echo "Extraction failed."
  exit 1
fi
