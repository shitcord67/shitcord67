#!/usr/bin/env python3
"""PDF-first screenshot processing pipeline.

Default behavior:
- Read PDFs from `convertedpdfs/` (or current directory as fallback)
- Render page 1 to PNG previews in `pdf-previews/`

Optional behavior:
- `--also-svg`: export an SVG alongside each PDF (best-effort only)
"""

from __future__ import annotations

import argparse
import glob
import os
import shutil
import subprocess
import sys


def tool_exists(name: str) -> bool:
    return shutil.which(name) is not None


def run_checked(args: list[str]) -> None:
    subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def collect_pdfs(root: str) -> list[str]:
    converted = glob.glob(os.path.join(root, "convertedpdfs", "*.pdf"))
    if converted:
        return sorted(converted)
    return sorted(glob.glob(os.path.join(root, "*.pdf")))


def render_pdf_first_page_png(pdf_path: str, output_png: str) -> tuple[bool, str]:
    base_no_ext = os.path.splitext(output_png)[0]

    if tool_exists("pdftoppm"):
        try:
            run_checked([
                "pdftoppm",
                "-f", "1",
                "-singlefile",
                "-png",
                pdf_path,
                base_no_ext
            ])
            return True, "pdftoppm"
        except subprocess.CalledProcessError as error:
            return False, f"pdftoppm failed: {error.stderr.strip()}"

    if tool_exists("magick"):
        try:
            run_checked(["magick", "-density", "180", f"{pdf_path}[0]", output_png])
            return True, "magick"
        except subprocess.CalledProcessError as error:
            return False, f"magick failed: {error.stderr.strip()}"

    return False, "No renderer found (install pdftoppm or ImageMagick `magick`)."


def export_svg_optional(pdf_path: str, svg_path: str) -> tuple[bool, str]:
    if not tool_exists("inkscape"):
        return False, "inkscape not installed"
    try:
        run_checked([
            "inkscape",
            "--without-gui",
            pdf_path,
            f"--export-plain-svg={svg_path}"
        ])
        return True, "inkscape"
    except subprocess.CalledProcessError as error:
        return False, f"inkscape failed: {error.stderr.strip()}"


def process_pdf(pdf_path: str, previews_dir: str, also_svg: bool) -> bool:
    base_name = os.path.basename(pdf_path)
    stem, _ = os.path.splitext(base_name)
    png_path = os.path.join(previews_dir, f"{stem}.png")

    ok, detail = render_pdf_first_page_png(pdf_path, png_path)
    if not ok:
        print(f"[error] {base_name}: {detail}")
        return False
    print(f"[ok] {base_name}: rendered PNG via {detail}")

    if also_svg:
        svg_path = os.path.join(previews_dir, f"{stem}.svg")
        svg_ok, svg_detail = export_svg_optional(pdf_path, svg_path)
        if svg_ok:
            print(f"[ok] {base_name}: exported SVG via {svg_detail}")
        else:
            print(f"[warn] {base_name}: SVG export skipped ({svg_detail})")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Process Discord reference screenshots from PDFs (preferred over SVG)."
    )
    parser.add_argument(
        "--root",
        default=os.getcwd(),
        help="Root directory containing PDFs or convertedpdfs/ (default: cwd)."
    )
    parser.add_argument(
        "--output",
        default="pdf-previews",
        help="Output directory for rendered previews (default: pdf-previews)."
    )
    parser.add_argument(
        "--also-svg",
        action="store_true",
        help="Also export SVG for each PDF (optional, best-effort)."
    )
    args = parser.parse_args()

    root = os.path.abspath(args.root)
    output_dir = os.path.join(root, args.output)
    ensure_dir(output_dir)

    pdfs = collect_pdfs(root)
    if not pdfs:
        print(f"No PDF files found under {root}")
        return 0

    print(f"Found {len(pdfs)} PDFs. Rendering PNG previews to {output_dir}")
    ok_count = 0
    for pdf in pdfs:
        if process_pdf(pdf, output_dir, args.also_svg):
            ok_count += 1

    print(f"Done. {ok_count}/{len(pdfs)} PDFs processed successfully.")
    return 0 if ok_count == len(pdfs) else 1


if __name__ == "__main__":
    sys.exit(main())
