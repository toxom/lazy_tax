#!/bin/bash
# Downloads the PocketBase binary for this machine into backend/
set -e
VERSION="0.40.6"
cd "$(dirname "$0")"

case "$(uname -s)" in
	Darwin) OS=darwin ;;
	Linux) OS=linux ;;
	*) echo "Unsupported OS"; exit 1 ;;
esac
case "$(uname -m)" in
	arm64 | aarch64) ARCH=arm64 ;;
	x86_64) ARCH=amd64 ;;
	*) echo "Unsupported arch"; exit 1 ;;
esac

ZIP="pocketbase_${VERSION}_${OS}_${ARCH}.zip"
curl -fsSL -o "$ZIP" "https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/${ZIP}"
unzip -o -q "$ZIP" pocketbase
rm "$ZIP"
chmod +x pocketbase
./pocketbase --version
echo "Run: ./dev.sh"
