import os
import zipfile
import shutil

def create_zip():
    project_dir = os.path.abspath("X:/pdf analyser")
    output_zip_local = os.path.join(project_dir, "ai_resume_hr_funnel_project.zip")
    desktop_dir = os.path.expanduser("C:/Users/hp/Desktop")
    output_zip_desktop = os.path.join(desktop_dir, "ai_resume_hr_funnel_project.zip")

    # Exclusions
    exclude_dirs = {
        ".venv", "node_modules", "__pycache__", ".git", "dist", ".system_generated"
    }
    exclude_extensions = {".pyc", ".zip"}

    print(f"Archiving project from: {project_dir}")
    print(f"Excluding heavy build/virtualenv folders: {exclude_dirs}")

    with zipfile.ZipFile(output_zip_local, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_dir):
            # Modify dirs in-place to avoid walking into excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                file_path = os.path.join(root, file)
                # Skip the zip file itself and pyc files
                if file.endswith(".zip") or any(file.endswith(ext) for ext in exclude_extensions):
                    continue

                arcname = os.path.relpath(file_path, project_dir)
                zipf.write(file_path, arcname)

    size_mb = os.path.getsize(output_zip_local) / (1024 * 1024)
    print(f"Successfully created: {output_zip_local} ({size_mb:.2f} MB)")

    # Also copy to Desktop for easy user access
    if os.path.exists(desktop_dir):
        try:
            shutil.copy2(output_zip_local, output_zip_desktop)
            print(f"Successfully copied to Desktop: {output_zip_desktop}")
        except Exception as e:
            print(f"Could not copy to Desktop: {e}")

if __name__ == "__main__":
    create_zip()
