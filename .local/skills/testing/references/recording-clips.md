# Browser recording clips


Only when the user asks for a video, instruct the testing subagent to return ordered pairs of screenshot IDs for the interactions to show, at most two minutes apart, from the same browser context and page. Task agents cannot export; return the pairs to the parent.

The testing agent will return the screenshot IDs in the text of the test report; use those IDs to export the clip.

Finish all browser work before exporting; even failed exports may end the session.

Call `exportBrowserRecordingClip({ startScreenshotId, endScreenshotId, speed: 2 })` once in CodeExecution using the selected IDs. You do not need to obtain session IDs or timestamps from the tester: the callback looks up the saved capture metadata. `speed` accepts 1, 2 or 4 and keeps every frame; 2 is usually recommended. Use 1 when the user needs to follow fast or detailed interactions.

Keep the returned `filePath` and `durationSeconds`. The MP4 is a local file in your current environment, not a published URL. Present that file once using your asset-presentation instructions. If presentation fails, reuse the MP4; don't export again. The clip may include extra footage around the selected screenshots. Exported clips can be used directly; cropping is not required.

If export fails, retry once with the same IDs. If that also fails, report it and use the screenshots as evidence instead; do not rerun the test or switch recording methods. On success, present the MP4 to the user and include it in the PR description (or other applicable evidence).
