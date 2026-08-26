# Hammer Brick & Home — Safe Image Cleanup

This adds a two-step image cleanup tool to Pages CMS.

## What it does

### Step 1 — Scan Unused Images
- Scans the entire `images/` folder.
- Checks HTML, CSS, JS, JSON, YAML, Markdown, XML and other text files across the repository.
- Treats an image as **used** if its filename or path appears anywhere in those files.
- Creates `admin-tools/unused-images-report.json`.
- Deletes **nothing**.

### Step 2 — Delete Verified Unused Images
- Reads the latest report you already reviewed.
- Scans the repository again.
- Deletes an image only if:
  1. it was in the latest report, and
  2. it is still unused during the second scan.
- Automatically protects common critical names such as `hero`, `logo`, `favicon`, `badge`, `qr`, `brand`, and `membership`.

Git history remains available if a file ever needs to be restored.

## Files to upload to GitHub

Upload these paths exactly:

- `.pages.yml` → repository root (replace your current one)
- `.github/workflows/gallery-image-cleanup.yml`
- `scripts/gallery_media_cleanup.py`
- `admin-tools/unused-images-report.json`

Do **not** put the workflow or script in the `images` folder.

## After uploading

1. Commit the files to your `main` branch.
2. Make sure GitHub Actions is enabled for the repository.
3. Open Pages CMS and refresh the repository.
4. You should see two new admin actions:
   - **Scan Unused Images**
   - **Delete Verified Unused Images**
5. Click **Scan Unused Images** first.
6. Wait for the GitHub Action to finish successfully.
7. Refresh Pages CMS.
8. Open **Unused Images Report** and review the images.
9. Only after reviewing, click **Delete Verified Unused Images**.
10. Confirm the warning.

The delete workflow will re-check every image before it deletes anything.
