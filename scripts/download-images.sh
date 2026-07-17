#!/usr/bin/env bash
# One-time fetch of all Thuc Coffee origin images into src/assets/images/.
# Origin HTTPS cert is broken (points at an unrelated domain), so this
# intentionally uses http:// for a one-time asset fetch only.
set -uo pipefail

ORIGIN="http://www.thuccoffee.com.vn"
URL_LIST="$(dirname "$0")/image-urls.txt"
DEST_ROOT="$(dirname "$0")/../src/assets/images"

if [[ ! -f "$URL_LIST" ]]; then
  echo "Missing $URL_LIST" >&2
  exit 1
fi

echo "=== Pre-flight HEAD-check sweep ==="
head_fail=0
head_total=0
while IFS=$'\t' read -r path sub; do
  [[ -z "$path" ]] && continue
  head_total=$((head_total + 1))
  status=$(curl -s -o /dev/null -w "%{http_code}" -I --max-time 15 "$ORIGIN$path")
  if [[ "$status" != "200" ]]; then
    echo "HEAD FAIL ($status): $path"
    head_fail=$((head_fail + 1))
  fi
done < "$URL_LIST"

echo "HEAD sweep: $((head_total - head_fail))/$head_total OK"
if (( head_fail > 5 )); then
  echo "ERROR: $head_fail/$head_total URLs failed HEAD check — possible large-scale origin failure. Aborting before full download." >&2
  exit 1
fi

echo "=== Downloading ==="
ok_count=0
fail_count=0
fail_list=()

for sub in products blog stores site; do
  mkdir -p "$DEST_ROOT/$sub"
done

while IFS=$'\t' read -r path sub; do
  [[ -z "$path" ]] && continue
  filename=$(basename "$path")
  dest="$DEST_ROOT/$sub/$filename"
  tmp="$dest.tmp"

  if [[ -f "$dest" ]]; then
    mime=$(file --mime-type -b "$dest" 2>/dev/null || echo "")
    if [[ "$mime" == image/* ]]; then
      echo "SKIP (exists, valid): $sub/$filename"
      ok_count=$((ok_count + 1))
      continue
    fi
  fi

  if curl -fSL --max-time 30 "$ORIGIN$path" -o "$tmp" 2>/dev/null; then
    mime=$(file --mime-type -b "$tmp" 2>/dev/null || echo "")
    size=$(stat -c%s "$tmp" 2>/dev/null || stat -f%z "$tmp" 2>/dev/null || echo 0)
    if [[ "$mime" == image/* && "$size" -gt 0 ]]; then
      mv -f "$tmp" "$dest"
      echo "OK: $sub/$filename"
      ok_count=$((ok_count + 1))
    else
      echo "FAIL (bad content-type '$mime' or 0-byte): $sub/$filename"
      rm -f "$tmp"
      fail_count=$((fail_count + 1))
      fail_list+=("$path")
    fi
  else
    echo "FAIL (curl error): $sub/$filename"
    rm -f "$tmp"
    fail_count=$((fail_count + 1))
    fail_list+=("$path")
  fi
done < "$URL_LIST"

echo ""
echo "=== Summary ==="
echo "OK: $ok_count"
echo "FAIL: $fail_count"

if (( fail_count > 0 )); then
  echo "Failed URLs:"
  printf '  %s\n' "${fail_list[@]}"
  echo ""
  echo "Script exiting non-zero — do not proceed to Phase 3 until this is resolved." >&2
  exit 1
fi

echo "All downloads OK."
exit 0
