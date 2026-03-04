# Continuity Log

## 2026-02-21T01:20:17+01:00

Uhm I don't see the client opening when I "npm run electron". I only see [electron] synced strophe runtime -> /home/duda/discord-lookalike-flash/vendor/strophe.umd.min.js
synced ruffle runtime -> /home/duda/discord-lookalike-flash/vendor/ruffle/ruffle.js
synced ruffle runtime -> /home/duda/discord-lookalike-flash/ruffle/ruffle.js
synced dotlottie runtime -> /home/duda/discord-lookalike-flash/vendor/dotlottie/dotlottie-player.mjs
synced dotlottie runtime -> /home/duda/discord-lookalike-flash/dotlottie/dotlottie-player.mjs
[run-client-stack] client server port 8080 already in use, reusing existing server.
[electron] [run-client-stack] xmpp gateway port 8790 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:8080
[run-client-stack] gateway: http://127.0.0.1:8790
[electron] [run-client-stack] press Ctrl+C to stop.
[run-client-stack] no processes started by this script.
[electron] stack exited code=0 signal=none.Oh I think that you also need to note down the last prompt of the user as the first thing after being prompted so that in case the context or the tokens of the LLM run out a future LLM instance can continue where left of. Please add this to LLM instructions as well so future LLMs really know! Also there should be a note that this stuff is LLM generated in the README and at the beginning (below the screenshot) should be instructions on how to run the electron and how to make a binary that can be run independently. Oh also what about IRC support? I think that could be achieved easily.
## 2026-02-21T01:25:56+01:00

I still don't see the client starting... [electron] synced strophe runtime -> /home/duda/discord-lookalike-flash/vendor/strophe.umd.min.js
synced ruffle runtime -> /home/duda/discord-lookalike-flash/vendor/ruffle/ruffle.js
synced ruffle runtime -> /home/duda/discord-lookalike-flash/ruffle/ruffle.js
synced dotlottie runtime -> /home/duda/discord-lookalike-flash/vendor/dotlottie/dotlottie-player.mjs
synced dotlottie runtime -> /home/duda/discord-lookalike-flash/dotlottie/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 8080 is listening but http://127.0.0.1:8080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 8080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none

## 2026-02-21T02:02:08+01:00

Okay. One issue: Imagine I'm trying to press one of the buttons of the privacy gate and thus I'm moving my mouse from below into it. But then the link shows and the buttons get pushed down. Can you make sure the buttons stay in place and instead the other stuff is pushed up? Then why when I upload files do other receive date-URLs? Looks also like receiving attachments like images takes long. Then when I'm logged in with derberg and writing with kazue why do I see two chats for derberg and kazue that belong together? Then why are the GIFs in the GIF picker so small? They all should be displayed with a minimum size. Then when I ESC the fullscreen from SWF PiP the SWF should not stop playing. Also why can't I resize the SWF PiP and the video dock? Then outside of PiP/dock please do not show controls for videos or SWFs when not hovering over the videos or SWFs or their controls themself. Then can you make sure there is automatic prevention to have the PiP/dock covering the input area? If it somehow covers it after e.g. launching it or resizing the window then immiadetly move it up in y direction. Then the video dock somehow doesn't allow collapsing similar to the SWF PiP? Please feel free to implement other stuff as well.

## 2026-02-21T02:18:59+01:00

Uhm I think you kind of broke the SWF dock/PiP display cause the Ruffle/SWF is now shown below it, partially covered? Then I also think that resizing the dock/PiPs should be possible on each edge and please make sure the content is properly resized cause it currently isn't for the video even... Then why is a native operating system window popping up when an SWF wants to open a link: couldn't we ask in shitcord67 itself it a link should be opened, without relying on unreliable operating system windows that might behave different everywhere or lead to lockups? Then now the link in privacy gate is sadly cut but it should be displayed completely without the privacy gate buttons moving. Then I noticed that edited messages actually don't get correctly edited but completely resend via XMPP, please fix. Then I think messages could be displayed more compact. E.g. it appears there is space above messages to have the time shown but couldn't the time on hover display in the same line as the text? Also I think the privacy gate can also extend in width to show the URL on hover btw. then I think the general disable button for privacy gate on each privacy gate instance is too much so please remove that from there. Then can you please implement that options I can't change due to lacking permissions in a chat are not shown? (Options not implemented can still be shown for now) and ofc you can't display "Owner" in my profile when I'm not actually owning the room/space/chat/group. Also would the bar to load older messages really be needed to display all the time cause I don't think it needs to. Then the red notification bubble should only be displayed when there are notifications. And it should display within it in white text how many notifications are there (e.g. amount of new aka. not seen mentions). Then can you make the member sidebar really make look like Discord? Example member sidebar with amount of people online/offline and then below "categories" with the highest member roless and members listed below. E.g. Axel's highest role is Admin and thus Axel appears under Admin. Also people do have icons showing if they are an APP, a Bot, using Web, mobile or Desktop PC. And people can have custom name colors, defined by role colors. Also there are these custom nameplates which I think are either clever CSS or SVG usage with SMIL. Can this even be implemented over XMPP somehow, custom extension other client instances might support, maybe you can write a XMPP spec extension draft if necessary?
## 2026-02-21T00:00:00Z
Ugh. I tasked an LLM before but hit into usage limit. Can you continue where it left off: Uhm I think you kind of broke the SWF dock/PiP display cause the Ruffle/SWF is now shown below it, partially covered? Then I also think that resizing the dock/PiPs should be possible on each edge and please make sure the content is properly resized cause it currently isn't for the video even... Then why is a native operating system window popping up when an SWF wants to open a link: couldn't we ask in shitcord67 itself it a link should be opened, without relying on unreliable operating system windows that might behave different everywhere or lead to lockups? Then now the link in privacy gate is sadly cut but it should be displayed completely without the privacy gate buttons moving. Then I noticed that edited messages actually don't get correctly edited but completely resend via XMPP, please fix. Then I think messages could be displayed more compact. E.g. it appears there is space above messages to have the time shown but couldn't the time on hover display in the same line as the text? Also I think the privacy gate can also extend in width to show the URL on hover btw. then I think the general disable button for privacy gate on each privacy gate instance is too much so please remove that from there. Then can you please implement that options I can't change due to lacking permissions in a chat are not shown? (Options not implemented can still be shown for now) and ofc you can't display "Owner" in my profile when I'm not actually owning the room/space/chat/group. Also would the bar to load older messages really be needed to display all the time cause I don't think it needs to. Then the red notification bubble should only be displayed when there are notifications. And it should display within it in white text how many notifications are there (e.g. amount of new aka. not seen mentions). Then can you make the member sidebar really make look like Discord? Example member sidebar with amount of people online/offline and then below "categories" with the highest member roless and members listed below. E.g. Axel's highest role is Admin and thus Axel appears under Admin. Also people do have icons showing if they are an APP, a Bot, using Web, mobile or Desktop PC. And people can have custom name colors, defined by role colors. Also there are these custom nameplates which I think are either clever CSS or SVG usage with SMIL. Can this even be implemented over XMPP somehow, custom extension other client instances might support, maybe you can write a XMPP spec extension draft if necessary?

(Attached in prompt: a very large Discord member-list HTML example and prior Codex `/status` output showing partial exploration/edits.)
## 2026-02-21T02:40:24+01:00
Ugh. I tasked an LLM before but hit into usage limit. Can you continue where it left off: Uhm I think you kind of broke the SWF dock/PiP display cause the Ruffle/SWF is now shown below it, partially covered? Then I also think that resizing the dock/PiPs should be possible on each edge and please make sure the content is properly resized cause it currently isn't for the video even... Then why is a native operating system window popping up when an SWF wants to open a link: couldn't we ask in shitcord67 itself it a link should be opened, without relying on unreliable operating system windows that might behave different everywhere or lead to lockups? Then now the link in privacy gate is sadly cut but it should be displayed completely without the privacy gate buttons moving. Then I noticed that edited messages actually don't get correctly edited but completely resend via XMPP, please fix. Then I think messages could be displayed more compact. E.g. it appears there is space above messages to have the time shown but couldn't the time on hover display in the same line as the text? Also I think the privacy gate can also extend in width to show the URL on hover btw. then I think the general disable button for privacy gate on each privacy gate instance is too much so please remove that from there. Then can you please implement that options I can't change due to lacking permissions in a chat are not shown? (Options not implemented can still be shown for now) and ofc you can't display "Owner" in my profile when I'm not actually owning the room/space/chat/group. Also would the bar to load older messages really be needed to display all the time cause I don't think it needs to. Then the red notification bubble should only be displayed when there are notifications. And it should display within it in white text how many notifications are there (e.g. amount of new aka. not seen mentions). Then can you make the member sidebar really make look like Discord? Example member sidebar with amount of people online/offline and then below "categories" with the highest member roless and members listed below. E.g. Axel's highest role is Admin and thus Axel appears under Admin. Also people do have icons showing if they are an APP, a Bot, using Web, mobile or Desktop PC. And people can have custom name colors, defined by role colors. Also there are these custom nameplates which I think are either clever CSS or SVG usage with SMIL. Can this even be implemented over XMPP somehow, custom extension other client instances might support, maybe you can write a XMPP spec extension draft if necessary?

User also included a very long Discord-like member list HTML example and prior /status output from a previous Codex session showing partially completed work and a usage-limit stop.
## 2026-02-21T03:00:09+01:00
I noticed that when I'm resizing Ruffle in-chat that it flickers a lot. Can't you maybe increase the message height live to prevent that? Also why can't I see the SWF when the SWF PiP is open? Could it be that it is displayed behind the PiP window we create? Also can you please not use system native dialogs to ask if I want to reset the SWF... couldn't you use a HTML pop-up maybe altert-style thing for that or popover or commandfor? Then for privacy gates, why is there sometimes some space between the button and the domain while the link is hidden? Then could you implement proper attachment sending via XMPP? Cause I see "1 local attachment not shareable over relay]" in Gajim. Also could you have a visual attachment preview (before sending an attachment) just like Discord? Then can you not display "Open in new tab" for videos and can you not display "Download SVG" in chat? For images/SVGs I think there should be a download button when I open them in the zoomed in display (after clicking once) and there should also be context menu options to copy e.g. link. Also does "Load older message" really need to be displayed all the time? Feel free to implement more stuff

## 2026-02-21T03:25:00+01:00
User prompt:
I noticed that when I'm resizing Ruffle in-chat that it flickers a lot. Can't you maybe increase the message height live to prevent that? Also why can't I see the SWF when the SWF PiP is open? Could it be that it is displayed behind the PiP window we create? Also can you please not use system native dialogs to ask if I want to reset the SWF... couldn't you use a HTML pop-up maybe altert-style thing for that or popover or commandfor? Then for privacy gates, why is there sometimes some space between the button and the domain while the link is hidden? Then could you implement proper attachment sending via XMPP? Cause I see "1 local attachment not shareable over relay]" in Gajim. Also could you have a visual attachment preview (before sending an attachment) just like Discord? Then can you not display "Open in new tab" for videos and can you not display "Download SVG" in chat? For images/SVGs I think there should be a download button when I open them in the zoomed in display (after clicking once) and there should also be context menu options to copy e.g. link. Also does "Load older message" really need to be displayed all the time? Feel free to implement more stuff

## 2026-02-21T02:21:48Z
A previous LLM tried this: XMPP HTTP upload (so local attachments become real links), OOB attachment stanza metadata, and the
  missing CSS fixes (privacy-gate spacing, lightbox actions/confirm styling, composer attachment thumbnails). Then I’ll run syntax
  checks.

## 2026-02-21T02:52:29Z
Great. Then I noticed I can't properly react to messages by using the three emojis from the message hover menu. They don't seem to get added on click. Also I noticed that e.g. when controls for an SWF or video are shown and then I try to reach the message hover menu that stuff can jump around cause the message hover menu is displayed a bit above the message (basically in the next above message), so maybe move it a bit further down? Then can you make the video dock resize properly like the SWF PiP. In fact, why aren't you reusing code from the SWF PiP for the video dock? Aren't they basically the same? Also are reactions actually properly implemented and using XMPP? Cause in a chat I see "/me retracted a previous message, but it's unsupported by your client." Then is displaying "Load older messages" all the time really necessary? Then can't you display the proper room/group/chat/space title/name at the top? And the description below. Then I think the button to hide channels makes everything shift to the right which is a heavy UX bug. Feel free to implement more

## 2026-02-21T03:21:31Z

Okay. why is it now that I don't seem to see DMs anymore? "Loading older messages..." is the only thing I see in direct message XMPP chats...

## 2026-02-21T03:22:03Z
Okay. why is it now that I don't seem to see DMs anymore? "Loading older messages..." is the only thing I see in direct message XMPP chats...

## 2026-03-03T04:41:50+01:00
Btw. when there are HTML files in chat, why is a save prompt dialog popping up the moment I open a chat without me having clicked anything to download the HTML? Also can you make sure that the video and SWF embeds are starting a bit higher in the message and that the open controls do not close while I'm over the message hover menu to e.g. select a reaction? Also why are the reactions not working? Also why are the GIFs in the GIF picker not having a minimum height and width Please never display them below 100x100 size.

## 2026-02-21T03:31:41Z
Btw. when there are HTML files in chat, why is a save prompt dialog popping up the moment I open a chat without me having clicked anything to download the HTML? Also can you make sure that the video and SWF embeds are starting a bit higher in the message and that the open controls do not close while I'm over the message hover menu to e.g. select a reaction? Also why are the reactions not working? Also why are the GIFs in the GIF picker not having a minimum height and width Please never display them below 100x100 size.

## 2026-02-21T03:53:16Z
￼app.js:19564 An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.
￼app.js:19564 An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.
￼ruffle_web.js:2149 INFO web￼/src/lib.rs:1379 Ruffle WASM module has been initialized
￼ruffle:1 New Ruffle instance created (Version: 0.2.0-nightly.2026.2.20 | WebAssembly extensions: ON | Used renderer: wgpu-webgl)
￼ruffle:1 Loading SWF file ￼https://xmpp.pimux.de/file_share/019c7e13-8554-7443-bbb2-d95ca3c24e57/precious_thing.swf
￼127.0.0.1/:1 Access to fetch at '\''￼https://xmpp.pimux.de/file_share/019c7e13-8554-7443-bbb2-d95ca3c24e57/precious_thing.swf'\'' from origin '\''￼http://127.0.0.1:38080'\'' has been blocked by CORS policy: The '\''Access-Control-Allow-Origin'\'' header has a value '\''￼http://127.0.0.1:8081'\'' that is not equal to the supplied origin. Have the server send the header with a valid value, or, if an opaque response serves your needs, set the request's mode to '\''no-cors'\'' to fetch the resource with CORS disabled.
￼xmpp.pimux.de/file_s…recious_thing.swf:1 ￼
 Failed to load resource: net::ERR_FAILED
￼ruffle_web.js:2149 ERROR web￼/src/lib.rs:1269 Unable to lock Ruffle core
￼ruffle:1 Ruffle instance destroyed.
￼ruffle_web.js:2149 ERROR web￼/src/navigator.rs:477 Asynchronous error occurred: Could not fetch: "Got JS error" Wtf why do I get this now? Also when I hover over a reaction, can you show me who reacted? Also why do I see two reactions when only I reacted? Also are reactions properly synced via XMPP? Also then for the GIF picker, why don't I get the privacy gate-like options and just GIF and video hidden message? Also why is the room/space/group description not displayed below the room/space/group title?

## 2026-02-21T04:09:47Z
Looks like it works now again? Anyways, why are reactions I apply are still not getting send to other people – looks like I get at least their reactions – and why do I see 2 reactions for DM channels when I only reacted once? Feel free to add more stuff you deem worth adding

## 2026-02-21T05:10:52+01:00
- Prompt: Also I noticed that when I click on a user profile that I don't see the avatar displayed there.

## 2026-02-21T05:12:44+01:00
- Prompt: Then what I also noticed is that there is always a red notification bubble at the shitcord67 logo. But it should only be present when I actually got messages or (new) mentions.
## 2026-02-22T00:37:05+01:00
Also yeah feel free to work on what you previously suggested. /usr/lib/node_modules/npm/lib/cli/validate-engines.js:29
    throw err
    ^

Error: ENOENT: no such file or directory, uv_cwd
    at process.wrappedCwd (node:internal/bootstrap/switches/does_own_process_state:144:28)
    at process.cwd (/usr/lib/node_modules/npm/node_modules/graceful-fs/polyfills.js:10:19)
    at new Config (/usr/lib/node_modules/npm/node_modules/@npmcli/config/lib/index.js:80:19)
    at new Npm (/usr/lib/node_modules/npm/lib/npm.js:67:19)
    at module.exports (/usr/lib/node_modules/npm/lib/cli/entry.js:14:15)
    at module.exports (/usr/lib/node_modules/npm/lib/cli/validate-engines.js:37:10)
    at module.exports (/usr/lib/node_modules/npm/lib/cli.js:12:31)
    at Object.<anonymous> (/usr/lib/node_modules/npm/bin/npm-cli.js:2:25)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1623:10) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'uv_cwd'
}

Node.js v20.19.6

[$TS] USER PROMPT:
/usr/lib/node_modules/npm/lib/cli/validate-engines.js:29
    throw err
    ^

Error: ENOENT: no such file or directory, uv_cwd
    at process.wrappedCwd (node:internal/bootstrap/switches/does_own_process_state:144:28)
    at process.cwd (/usr/lib/node_modules/npm/node_modules/graceful-fs/polyfills.js:10:19)
    at new Config (/usr/lib/node_modules/npm/node_modules/@npmcli/config/lib/index.js:80:19)
    at new Npm (/usr/lib/node_modules/npm/lib/npm.js:67:19)
    at module.exports (/usr/lib/node_modules/npm/lib/cli/entry.js:14:15)
    at module.exports (/usr/lib/node_modules/npm/lib/cli/validate-engines.js:37:10)
    at module.exports (/usr/lib/node_modules/npm/lib/cli.js:12:31)
    at Object.<anonymous> (/usr/lib/node_modules/npm/bin/npm-cli.js:2:25)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1623:10) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'uv_cwd'
}

Node.js v20.19.6
Can you fix this?
[2026-02-22T02:22:38+01:00] USER PROMPT (corrected timestamp copy):
/usr/lib/node_modules/npm/lib/cli/validate-engines.js:29
    throw err
    ^

Error: ENOENT: no such file or directory, uv_cwd
    at process.wrappedCwd (node:internal/bootstrap/switches/does_own_process_state:144:28)
    at process.cwd (/usr/lib/node_modules/npm/node_modules/graceful-fs/polyfills.js:10:19)
    at new Config (/usr/lib/node_modules/npm/node_modules/@npmcli/config/lib/index.js:80:19)
    at new Npm (/usr/lib/node_modules/npm/lib/npm.js:67:19)
    at module.exports (/usr/lib/node_modules/npm/lib/cli/entry.js:14:15)
    at module.exports (/usr/lib/node_modules/npm/lib/cli/validate-engines.js:37:10)
    at module.exports (/usr/lib/node_modules/npm/lib/cli.js:12:31)
    at Object.<anonymous> (/usr/lib/node_modules/npm/bin/npm-cli.js:2:25)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1623:10) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'uv_cwd'
}

Node.js v20.19.6
Can you fix this?
[2026-02-22T02:24:40+01:00] USER PROMPT:
Desktop window opened, but backend is unavailable
Expected URL: http://127.0.0.1:18081/

Could not start local client stack on any candidate port (8080, 18080, 8081, 38080, 18081). Last error: Local stack exited early (code=1, signal=none)..

The app opened, but the local client URL is unavailable.
￼Retry loading app
[2026-02-22T02:25:03+01:00] USER PROMPT:
[electron] starting local stack (client=127.0.0.1:8080, gateway=127.0.0.1:8790, mode=auto)
[electron] stack stderr: strophe runtime source missing: /home/duda/discord-lookalike-flash/node_modules/strophe.js/dist/strophe.umd.min.js
[electron] stack stderr: [run-client-stack] warning: runtime sync failed; media runtime fallbacks may be unavailable.
[electron] stack stderr: [run-client-stack] client server port 8080 is listening but http://127.0.0.1:8080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 8080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=8080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:18080
[electron] starting local stack (client=127.0.0.1:18080, gateway=127.0.0.1:8790, mode=auto)
[electron] stack stderr: strophe runtime source missing: /home/duda/discord-lookalike-flash/node_modules/strophe.js/dist/strophe.umd.min.js
[electron] stack stderr: [run-client-stack] warning: runtime sync failed; media runtime fallbacks may be unavailable.
[electron] stack stderr: [run-client-stack] client server port 18080 is listening but http://127.0.0.1:18080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 18080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=18080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:8081
[electron] starting local stack (client=127.0.0.1:8081, gateway=127.0.0.1:8790, mode=auto)
[electron] stack stderr: strophe runtime source missing: /home/duda/discord-lookalike-flash/node_modules/strophe.js/dist/strophe.umd.min.js
[electron] stack stderr: [run-client-stack] warning: runtime sync failed; media runtime fallbacks may be unavailable.
[electron] stack stderr: [run-client-stack] client server port 8081 is listening but http://127.0.0.1:8081/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 8081 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=8081 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:38080
[electron] starting local stack (client=127.0.0.1:38080, gateway=127.0.0.1:8790, mode=auto)
[electron] stack stderr: strophe runtime source missing: /home/duda/discord-lookalike-flash/node_modules/strophe.js/dist/strophe.umd.min.js
[electron] stack stderr: [run-client-stack] warning: runtime sync failed; media runtime fallbacks may be unavailable.
[electron] stack stderr: [run-client-stack] client server port 38080 is listening but http://127.0.0.1:38080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 38080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=38080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:18081
[electron] starting local stack (client=127.0.0.1:18081, gateway=127.0.0.1:8790, mode=auto)
[electron] stack stderr: strophe runtime source missing: /home/duda/discord-lookalike-flash/node_modules/strophe.js/dist/strophe.umd.min.js
[electron] stack stderr: [run-client-stack] warning: runtime sync failed; media runtime fallbacks may be unavailable.
[electron] stack stderr: [run-client-stack] client server port 18081 is listening but http://127.0.0.1:18081/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 18081 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=18081 error=Local stack exited early (code=1, signal=none).
[electron] startup warning Could not start local client stack on any candidate port (8080, 18080, 8081, 38080, 18081). Last error: Local stack exited early (code=1, signal=none)..
(node:859895) electron: Failed to load URL: http://127.0.0.1:18081/ with error: ERR_EMPTY_RESPONSE
(Use `electron --trace-warnings ...` to show where the warning was created)
[electron] client load failed ERR_EMPTY_RESPONSE (-324) loading 'http://127.0.0.1:18081/'
[2026-02-22T02:30:21+01:00] USER PROMPT:
So did you remove IRC, Matrix and Shitcord support then?
[2026-02-22T02:31:03+01:00] USER PROMPT:
So then why can't I select between them on the login screen?
[2026-02-22T03:17:42+01:00] USER PROMPT:
Yeah and also add the selection for stored user accounts back as well
[2026-02-22T03:49:47+01:00] USER PROMPT:
Eh please do not include a dropdown to select transport mode. Instead just use XMPP per default for now and have
  a dropdown for .xmpp.local.js. Please add entries for kazue@xmpp.jp with password kazuekazue and
  derberg@pimux.de with password my>!H7V7=H<>aD>Y
[2026-02-22T04:19:06+01:00] USER PROMPT:
Eh, well. .json is correct, not .js SORRY
[2026-02-22T04:20:30+01:00] USER PROMPT:
Okay then next can you implement more XEPs or make the UI better? More features of Discord?

[2026-02-22T04:21:59+01:00] USER PROMPT: Okay then next can you implement more XEPs or make the UI better? More features of Discord?

[2026-02-22T04:50:46+01:00] USER PROMPT: Yeah

[2026-02-22T04:53:26+01:00] USER PROMPT: Yeah, add all the cool features!

[2026-02-22T04:56:36+01:00] USER PROMPT: Yes
[2026-02-22T05:20:06+01:00] USER PROMPT: Yes
[2026-02-22T05:41:21+01:00] USER PROMPT: Yes
[2026-02-22T05:56:36+01:00] USER PROMPT: Yes
[2026-02-22T06:01:01+01:00] USER PROMPT: I have the small issue ant that is when I try to click on a button of one of the control things that can be hidden that suddenly the controls get hidden... Please prevent that.

## 2026-02-22T08:43:16+01:00
Do your thing

## 2026-02-22T08:51:10+01:00
Continue

## 2026-02-22T09:05:43+01:00
Please continue with 20 more features unattended.
[2026-02-22T09:08:00+01:00] Please continue with 20 more features unattended.
2026-02-22T18:18:32Z | USER_PROMPT | Please do your thing
2026-02-22T18:24:45Z | USER_PROMPT | Oh the shop stuff is not important, other stuff
2026-02-22T18:31:55Z | USER_PROMPT | Yes
$ts | USER_PROMPT | I noticed that the privacy gate is broken (nothing happens on button click), then in the GIF picker it also doesn't show privacy gate options and the Sticker picker seems to have no enforced sticker display size, thus everything will look small after a few seconds there. Also when I click on the profile of a user I still don't see their avatar there, despite it showing in the sidebar and the chat. Oh also when I click on a profile picture in the chat then the user profile should open as well. And on the user profile it should be possible to click on the profile picture to open an extended profile with tabs to show which guilds and friends are shared among that user and the logged in user. Also when clicked on the profile picture in this view then the image viewer should show the profile big.
2026-02-22T18:49:51Z | USER_PROMPT (corrected timestamp copy) | I noticed that the privacy gate is broken (nothing happens on button click), then in the GIF picker it also doesn't show privacy gate options and the Sticker picker seems to have no enforced sticker display size, thus everything will look small after a few seconds there. Also when I click on the profile of a user I still don't see their avatar there, despite it showing in the sidebar and the chat. Oh also when I click on a profile picture in the chat then the user profile should open as well. And on the user profile it should be possible to click on the profile picture to open an extended profile with tabs to show which guilds and friends are shared among that user and the logged in user. Also when clicked on the profile picture in this view then the image viewer should show the profile big.

## 2026-02-22T19:00:49Z
I noticed that the privacy gate is broken (nothing happens on button click), then in the GIF picker it also doesn't show privacy gate options and the Sticker picker seems to have no enforced sticker display size, thus everything will look small after a few seconds there. Also when I click on the profile of a user I still don't see their avatar there, despite it showing in the sidebar and the chat. Oh also when I click on a profile picture in the chat then the user profile should open as well. And on the user profile it should be possible to click on the profile picture to open an extended profile with tabs to show which guilds and friends are shared among that user and the logged in user. Also when clicked on the profile picture in this view then the image viewer should show the profile big.

## 2026-02-22T19:27:35Z
After I allowed a file via privacy gate then immiadetly show it. Then I noticed adding URLs doesn't work in the file picker; no dialog shows up to enter one... Then the Sticker picker still has no enforced sticker display size...

## 2026-02-22T20:27:24Z
Btw. can't you use github's gh command to create releases? Cause then I would like you to create a release on what is currently remote master.

## 2026-02-22T20:32:54Z
Then can you try to create an Android client now? Ideally there should be one codebase and from that I can create clients for several platforms with minimal added code for them.

## 2026-02-22T21:06:03Z
Can you create me a build script which lets me choose the platform? electron, web, android. Also clean & build by default unless I pass --build

## 2026-02-22T21:06:30Z
Or better, please ask me if I want to clean before build...

## 2026-02-22T21:23:40Z
I think there should actually be a build script in the root directory of the project.

## 2026-02-22T21:24:38Z
Also can you note more clear in the README that an LLM writes all the code, forget about the review part.

## 2026-02-22T21:25:00Z
And please commit the TODOs alwayss, lol

## 2026-02-22T21:49:57Z
Ok to proceed? (y) 
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@electron/packager@19.0.5',
npm WARN EBADENGINE   required: { node: '>= 22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@electron/asar@4.0.1',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@electron/get@4.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@electron/notarize@3.1.1',
npm WARN EBADENGINE   required: { node: '>= 22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@electron/osx-sign@2.3.0',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@electron/universal@3.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '@electron/windows-sign@2.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'galactus@2.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'flora-colossus@3.0.2',
npm WARN EBADENGINE   required: { node: '>=22.12.0' },
npm WARN EBADENGINE   current: { node: 'v20.19.6', npm: '7.6.3' }
npm WARN EBADENGINE }
npm WARN deprecated boolean@3.2.0: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm WARN deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
npm WARN deprecated glob@11.1.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

## 2026-02-22T21:50:54Z
dist/electron/shitcord67-linux-x64/shitcord67 but the window doesn't open?

## 2026-02-22T22:40:08Z
23:30:42 ~/shitcord67:$ ./build.sh electron
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
WARNING: asar parameter set to an invalid value (false), ignoring and disabling asar
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] electron output: dist/electron
doesn't open the app vs: 23:38:08 ~/shitcord67:$ npm run electron

> discord-lookalike-flash@1.0.0 electron
> electron electron/main.cjs


(electron:846174): Gtk-WARNING **: 23:38:15.011: Theme parsing error: gtk.css:63:28: The :prelight pseudo-class is deprecated. Use :hover instead.

(electron:846174): Gtk-WARNING **: 23:38:15.011: Theme parsing error: gtk.css:73:35: The :prelight pseudo-class is deprecated. Use :hover instead.

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk.css:115:31: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk.css:116:24: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk.css:145:27: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk.css:146:29: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk.css:166:34: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk.css:187:34: The :inconsistent pseudo-class is deprecated. Use :indeterminate instead.

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk-dark.css:52:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.012: Theme parsing error: gtk-dark.css:106:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:210:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:334:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:359:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:392:31: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:561:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:569:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:606:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:614:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:667:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:673:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.013: Theme parsing error: gtk-dark.css:690:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.014: Theme parsing error: gtk-dark.css:1119:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.016: Theme parsing error: gtk-dark.css:2113:42: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.016: Theme parsing error: gtk-dark.css:2123:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.016: Theme parsing error: gtk-dark.css:2126:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.016: Theme parsing error: gtk-dark.css:2303:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.017: Theme parsing error: gtk-dark.css:2557:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.017: Theme parsing error: gtk-dark.css:2560:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.017: Theme parsing error: gtk-dark.css:2566:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.017: Theme parsing error: gtk-dark.css:2581:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.017: Theme parsing error: gtk-dark.css:2585:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.018: Theme parsing error: gtk-dark.css:3209:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.018: Theme parsing error: gtk-dark.css:3278:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.018: Theme parsing error: gtk-dark.css:3279:37: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.019: Theme parsing error: gtk-dark.css:3410:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.019: Theme parsing error: gtk-dark.css:3496:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.019: Theme parsing error: gtk-dark.css:3507:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.019: Theme parsing error: gtk-dark.css:3981:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.019: Theme parsing error: gtk-dark.css:3987:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.019: Theme parsing error: gtk-dark.css:4015:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.020: Theme parsing error: gtk-dark.css:4498:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.020: Theme parsing error: gtk-dark.css:4665:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.020: Theme parsing error: gtk-dark.css:4755:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.021: Theme parsing error: gtk-dark.css:5262:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.021: Theme parsing error: gtk-dark.css:5342:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.021: Theme parsing error: gtk-dark.css:5348:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.021: Theme parsing error: gtk-dark.css:5365:30: Invalid number for alpha value
[electron] starting local stack (client=127.0.0.1:8080, gateway=127.0.0.1:8790, mode=auto)

(electron:846174): Gtk-WARNING **: 23:38:15.111: Theme parsing error: gtk.css:52:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:106:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:210:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:334:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:359:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:392:31: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:561:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:569:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:606:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:614:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:667:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:673:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.112: Theme parsing error: gtk.css:690:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.113: Theme parsing error: gtk.css:1119:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2113:42: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2123:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2126:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2303:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2557:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2560:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2566:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2581:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.115: Theme parsing error: gtk.css:2585:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.116: Theme parsing error: gtk.css:3209:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.116: Theme parsing error: gtk.css:3278:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.116: Theme parsing error: gtk.css:3279:37: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.116: Theme parsing error: gtk.css:3410:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.116: Theme parsing error: gtk.css:3496:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.116: Theme parsing error: gtk.css:3507:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.117: Theme parsing error: gtk.css:3981:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.117: Theme parsing error: gtk.css:3987:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.117: Theme parsing error: gtk.css:4015:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.118: Theme parsing error: gtk.css:4498:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.119: Theme parsing error: gtk.css:4665:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.119: Theme parsing error: gtk.css:4755:41: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.120: Theme parsing error: gtk.css:5262:30: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.120: Theme parsing error: gtk.css:5342:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.120: Theme parsing error: gtk.css:5348:38: Invalid number for alpha value

(electron:846174): Gtk-WARNING **: 23:38:15.120: Theme parsing error: gtk.css:5365:30: Invalid number for alpha value
[electron] synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 8080 is listening but http://127.0.0.1:8080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 8080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=8080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:18080
[electron] starting local stack (client=127.0.0.1:18080, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 18080 is listening but http://127.0.0.1:18080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 18080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=18080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:8081
[electron] starting local stack (client=127.0.0.1:8081, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 846350)
[electron] [run-client-stack] xmpp gateway port 8790 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:8081/
[run-client-stack] gateway: http://127.0.0.1:8790
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] code 404, message File not found
127.0.0.1 - - [22/Feb/2026 23:38:16] "GET /vendor/ruffle/ruffle.js HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] "GET /swf-index.json HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] "GET /vendor/strophe.umd.min.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [22/Feb/2026 23:38:16] code 404, message File not found
127.0.0.1 - - [22/Feb/2026 23:38:16] "GET /vendor/dotlottie/dotlottie-player.mjs HTTP/1.1" 404 -
[electron] stopping local stack
[electron] stopping local stack

## 2026-02-22T22:50:31Z
Btw. can you also tag Commit 45f3347 as version 1?

## 2026-02-22T22:51:37Z
23:46:19 ~/shitcord67:$ dist/electron/shitcord67-linux-x64/shitcord67 

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:63:28: The :prelight pseudo-class is deprecated. Use :hover instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:73:35: The :prelight pseudo-class is deprecated. Use :hover instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:115:31: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:116:24: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:145:27: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:146:29: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:166:34: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk.css:187:34: The :inconsistent pseudo-class is deprecated. Use :indeterminate instead.

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk-dark.css:52:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.586: Theme parsing error: gtk-dark.css:106:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:210:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:334:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:359:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:392:31: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:561:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:569:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:606:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:614:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:667:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:673:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.587: Theme parsing error: gtk-dark.css:690:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.588: Theme parsing error: gtk-dark.css:1119:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.590: Theme parsing error: gtk-dark.css:2113:42: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.590: Theme parsing error: gtk-dark.css:2123:41: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.590: Theme parsing error: gtk-dark.css:2126:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.590: Theme parsing error: gtk-dark.css:2303:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.591: Theme parsing error: gtk-dark.css:2557:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.591: Theme parsing error: gtk-dark.css:2560:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.591: Theme parsing error: gtk-dark.css:2566:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.591: Theme parsing error: gtk-dark.css:2581:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.591: Theme parsing error: gtk-dark.css:2585:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.592: Theme parsing error: gtk-dark.css:3209:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.592: Theme parsing error: gtk-dark.css:3278:41: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.592: Theme parsing error: gtk-dark.css:3279:37: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.592: Theme parsing error: gtk-dark.css:3410:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.592: Theme parsing error: gtk-dark.css:3496:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.592: Theme parsing error: gtk-dark.css:3507:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.593: Theme parsing error: gtk-dark.css:3981:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.593: Theme parsing error: gtk-dark.css:3987:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.593: Theme parsing error: gtk-dark.css:4015:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.593: Theme parsing error: gtk-dark.css:4498:41: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.594: Theme parsing error: gtk-dark.css:4665:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.594: Theme parsing error: gtk-dark.css:4755:41: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.594: Theme parsing error: gtk-dark.css:5262:30: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.594: Theme parsing error: gtk-dark.css:5342:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.594: Theme parsing error: gtk-dark.css:5348:38: Invalid number for alpha value

(shitcord67:887061): Gtk-WARNING **: 23:50:18.595: Theme parsing error: gtk-dark.css:5365:30: Invalid number for alpha value
[electron] starting local stack (client=127.0.0.1:8080, gateway=127.0.0.1:8790, mode=auto)
...
[887376:0222/235020.394269:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.RTaBxj failed: No such process (3)
[887376:0222/235020.394339:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[887376:0222/235020.394358:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
[electron] client load failed ERR_FAILED (-2) loading 'http://127.0.0.1:38080/'
Trace/Breakpoint ausgelöst(Speicherabzug geschrieben) dist/electron/shitcord67-linux-x64/shitcord67

## 2026-02-22T23:01:00Z
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 8080 is listening but http://127.0.0.1:8080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 8080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=8080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:18080
[electron] starting local stack (client=127.0.0.1:18080, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 18080 is listening but http://127.0.0.1:18080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 18080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=18080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:8081
[electron] starting local stack (client=127.0.0.1:8081, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 8081 is listening but http://127.0.0.1:8081/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 8081 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=8081 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:38080
[electron] starting local stack (client=127.0.0.1:38080, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 38080 is listening but http://127.0.0.1:38080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 38080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=38080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:18081
[electron] starting local stack (client=127.0.0.1:18081, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 18081 is listening but http://127.0.0.1:18081/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 18081 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=18081 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:41329
[electron] starting local stack (client=127.0.0.1:41329, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 919062)
[electron] [run-client-stack] xmpp gateway port 8790 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:41329/
[run-client-stack] gateway: http://127.0.0.1:8790
[electron] [run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 00:00:01] "GET / HTTP/1.1" 200 -
[919075:0223/000001.791403:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.XGjshY failed: No such process (3)
[919075:0223/000001.791479:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[919075:0223/000001.791506:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 00:00:01] "GET / HTTP/1.1" 200 -
[electron] client load failed ERR_FAILED (-2) loading 'http://127.0.0.1:41329/'
Trace/Breakpoint ausgelöst(Speicherabzug geschrieben) dist/electron/shitcord67-linux-x64/shitcord67

## 2026-02-22T23:25:20Z
nj failed: No such process (3)
[1000896:0223/002453.924678:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1000896:0223/002453.934783:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.L8umUI failed: No such process (3)
[1000896:0223/002453.934819:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1000896:0223/002453.944941:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.dIZVHY failed: No such process (3)
[1000896:0223/002453.944986:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1000896:0223/002453.955094:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.eTRc0S failed: No such process (3)
[1000896:0223/002453.955134:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1000896:0223/002453.965234:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.2xUFGM failed: No such process (3)
[1000896:0223/002453.965267:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1000896:0223/002453.975393:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.KhvFqg failed: No such process (3)
[1000896:0223/002453.975440:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1000896:0223/002453.985574:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.diN3fy failed: No such process (3)
[1000896:0223/002453.985636:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1000896:0223/002453.995773:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.exs69Q failed: No such process (3)
[1000896:0223/002453.995825:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
^C[electron] stopping local stack
[electron] [run-client-stack] shutting down...

[2026-02-23 01:40:17 UTC]
02:22:20 ~/shitcord67:$ ./build.sh electron --clean
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] electron output: dist/electron
02:27:39 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
bash: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64: Ist ein Verzeichnis
02:37:54 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/
chrome-sandbox*          libGLESv2.so*            libvulkan.so.1*          shitcord67*
chrome_crashpad_handler* libffmpeg.so*            locales/                 
libEGL.so*               libvk_swiftshader.so*    resources/               
02:37:54 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67 
[electron] packaged linux flags: sandbox=off shm=tmp runtimeTmp=/home/duda/.cache/shitcord67/runtime

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:63:28: The :prelight pseudo-class is deprecated. Use :hover instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:73:35: The :prelight pseudo-class is deprecated. Use :hover instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:115:31: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:116:24: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:145:27: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:146:29: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:166:34: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk.css:187:34: The :inconsistent pseudo-class is deprecated. Use :indeterminate instead.

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk-dark.css:52:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.018: Theme parsing error: gtk-dark.css:106:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:210:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:334:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:359:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:392:31: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:561:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:569:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:606:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:614:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:667:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:673:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.019: Theme parsing error: gtk-dark.css:690:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.020: Theme parsing error: gtk-dark.css:1119:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2113:42: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2123:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2126:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2303:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2557:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2560:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2566:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2581:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.022: Theme parsing error: gtk-dark.css:2585:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.023: Theme parsing error: gtk-dark.css:3209:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.023: Theme parsing error: gtk-dark.css:3278:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.023: Theme parsing error: gtk-dark.css:3279:37: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.023: Theme parsing error: gtk-dark.css:3410:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.024: Theme parsing error: gtk-dark.css:3496:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.024: Theme parsing error: gtk-dark.css:3507:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.024: Theme parsing error: gtk-dark.css:3981:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.024: Theme parsing error: gtk-dark.css:3987:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.024: Theme parsing error: gtk-dark.css:4015:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.025: Theme parsing error: gtk-dark.css:4498:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.025: Theme parsing error: gtk-dark.css:4665:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.025: Theme parsing error: gtk-dark.css:4755:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.026: Theme parsing error: gtk-dark.css:5262:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.026: Theme parsing error: gtk-dark.css:5342:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.026: Theme parsing error: gtk-dark.css:5348:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.026: Theme parsing error: gtk-dark.css:5365:30: Invalid number for alpha value
[electron] starting local stack (client=127.0.0.1:8080, gateway=127.0.0.1:8790, mode=auto)

(shitcord67:259400): Gtk-WARNING **: 02:38:00.110: Theme parsing error: gtk.css:52:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.110: Theme parsing error: gtk.css:106:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.110: Theme parsing error: gtk.css:210:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:334:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:359:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:392:31: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:561:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:569:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:606:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:614:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:667:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:673:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.111: Theme parsing error: gtk.css:690:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.112: Theme parsing error: gtk.css:1119:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.113: Theme parsing error: gtk.css:2113:42: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.113: Theme parsing error: gtk.css:2123:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.113: Theme parsing error: gtk.css:2126:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.114: Theme parsing error: gtk.css:2303:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.114: Theme parsing error: gtk.css:2557:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.114: Theme parsing error: gtk.css:2560:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.114: Theme parsing error: gtk.css:2566:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.114: Theme parsing error: gtk.css:2581:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.114: Theme parsing error: gtk.css:2585:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.115: Theme parsing error: gtk.css:3209:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.115: Theme parsing error: gtk.css:3278:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.115: Theme parsing error: gtk.css:3279:37: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.115: Theme parsing error: gtk.css:3410:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.115: Theme parsing error: gtk.css:3496:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.115: Theme parsing error: gtk.css:3507:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.116: Theme parsing error: gtk.css:3981:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.116: Theme parsing error: gtk.css:3987:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.116: Theme parsing error: gtk.css:4015:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.117: Theme parsing error: gtk.css:4498:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.117: Theme parsing error: gtk.css:4665:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.117: Theme parsing error: gtk.css:4755:41: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.118: Theme parsing error: gtk.css:5262:30: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.118: Theme parsing error: gtk.css:5342:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.118: Theme parsing error: gtk.css:5348:38: Invalid number for alpha value

(shitcord67:259400): Gtk-WARNING **: 02:38:00.118: Theme parsing error: gtk.css:5365:30: Invalid number for alpha value
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 259557)
[electron] [run-client-stack] started xmpp-auth-gateway (pid 259564)
[run-client-stack] client: http://127.0.0.1:8080/
[run-client-stack] gateway: http://127.0.0.1:8790
[run-client-stack] press Ctrl+C to stop.
[electron] xmpp auth gateway listening on http://127.0.0.1:8790
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 02:38:00] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 02:38:00] "GET / HTTP/1.1" 200 -
[259625:0223/023800.479784:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.Jyy1JP failed: No such process (3)
[259625:0223/023800.479867:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.493736:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.d7QCmy failed: No such process (3)
[259625:0223/023800.493798:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 02:38:00] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 02:38:00] "GET /app.js HTTP/1.1" 200 -
[259625:0223/023800.503974:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.g9mDRG failed: No such process (3)
[259625:0223/023800.504052:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.514277:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.xyi9uq failed: No such process (3)
[259625:0223/023800.514369:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.524571:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.El4oBV failed: No such process (3)
[259625:0223/023800.524658:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.534835:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.RqB04p failed: No such process (3)
[259625:0223/023800.534915:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.545070:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.f86XpT failed: No such process (3)
[259625:0223/023800.545151:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.555329:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.h1Yvra failed: No such process (3)
[259625:0223/023800.555404:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.565527:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.NbHfzY failed: No such process (3)
[259625:0223/023800.565605:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.575770:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.KEPSMu failed: No such process (3)
[259625:0223/023800.575845:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.585977:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.v3RuQq failed: No such process (3)
[259625:0223/023800.586044:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.596241:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.jzfqrC failed: No such process (3)
[259625:0223/023800.596324:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.606478:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.vK4TlW failed: No such process (3)
[259625:0223/023800.606545:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.616659:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.xPcbcf failed: No such process (3)
[259625:0223/023800.616702:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.626842:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.aYTRKg failed: No such process (3)
[259625:0223/023800.626910:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[259625:0223/023800.637072:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.Aayl40 failed: No such process (3)
[259625:0223/023800.637143:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 02:38:00] "GET /.xmpp.local.json HTTP/1.1" 200 -
[259625:0223/023800.705157:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.QLfunA failed: No such process (3)
[259625:0223/023800.705232:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)

[2026-02-23 02:16:02 UTC]
Still an issue 3:09:51 ~/shitcord67:$ ./build.sh electron --clean
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] electron output: dist/electron
03:11:28 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67 
[electron] packaged linux flags: sandbox=off shm=tmp runtimeTmp=/home/duda/.cache/shitcord67/runtime

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:63:28: The :prelight pseudo-class is deprecated. Use :hover instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:73:35: The :prelight pseudo-class is deprecated. Use :hover instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:115:31: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:116:24: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:145:27: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:146:29: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:166:34: The :insensitive pseudo-class is deprecated. Use :disabled instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk.css:187:34: The :inconsistent pseudo-class is deprecated. Use :indeterminate instead.

(shitcord67:416942): Gtk-WARNING **: 03:12:01.586: Theme parsing error: gtk-dark.css:52:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:106:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:210:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:334:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:359:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:392:31: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:561:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:569:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:606:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:614:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:667:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:673:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.587: Theme parsing error: gtk-dark.css:690:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.588: Theme parsing error: gtk-dark.css:1119:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2113:42: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2123:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2126:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2303:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2557:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2560:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2566:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2581:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.590: Theme parsing error: gtk-dark.css:2585:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.591: Theme parsing error: gtk-dark.css:3209:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.591: Theme parsing error: gtk-dark.css:3278:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.591: Theme parsing error: gtk-dark.css:3279:37: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.592: Theme parsing error: gtk-dark.css:3410:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.592: Theme parsing error: gtk-dark.css:3496:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.592: Theme parsing error: gtk-dark.css:3507:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.592: Theme parsing error: gtk-dark.css:3981:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.592: Theme parsing error: gtk-dark.css:3987:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.592: Theme parsing error: gtk-dark.css:4015:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.593: Theme parsing error: gtk-dark.css:4498:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.593: Theme parsing error: gtk-dark.css:4665:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.593: Theme parsing error: gtk-dark.css:4755:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.594: Theme parsing error: gtk-dark.css:5262:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.594: Theme parsing error: gtk-dark.css:5342:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.594: Theme parsing error: gtk-dark.css:5348:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.594: Theme parsing error: gtk-dark.css:5365:30: Invalid number for alpha value
[electron] starting local stack (client=127.0.0.1:8080, gateway=127.0.0.1:8790, mode=auto)

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:52:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:106:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:210:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:334:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:359:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:392:31: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:561:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:569:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:606:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.670: Theme parsing error: gtk.css:614:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.671: Theme parsing error: gtk.css:667:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.671: Theme parsing error: gtk.css:673:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.671: Theme parsing error: gtk.css:690:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.671: Theme parsing error: gtk.css:1119:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2113:42: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2123:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2126:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2303:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2557:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2560:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2566:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2581:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.673: Theme parsing error: gtk.css:2585:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.674: Theme parsing error: gtk.css:3209:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.674: Theme parsing error: gtk.css:3278:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.674: Theme parsing error: gtk.css:3279:37: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.675: Theme parsing error: gtk.css:3410:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.675: Theme parsing error: gtk.css:3496:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.675: Theme parsing error: gtk.css:3507:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.675: Theme parsing error: gtk.css:3981:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.675: Theme parsing error: gtk.css:3987:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.675: Theme parsing error: gtk.css:4015:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.676: Theme parsing error: gtk.css:4498:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.676: Theme parsing error: gtk.css:4665:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.676: Theme parsing error: gtk.css:4755:41: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.677: Theme parsing error: gtk.css:5262:30: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.677: Theme parsing error: gtk.css:5342:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.677: Theme parsing error: gtk.css:5348:38: Invalid number for alpha value

(shitcord67:416942): Gtk-WARNING **: 03:12:01.677: Theme parsing error: gtk.css:5365:30: Invalid number for alpha value
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 417019)
[electron] [run-client-stack] started xmpp-auth-gateway (pid 417022)
[run-client-stack] client: http://127.0.0.1:8080/
[electron] [run-client-stack] gateway: http://127.0.0.1:8790
[run-client-stack] press Ctrl+C to stop.
[electron] xmpp auth gateway listening on http://127.0.0.1:8790
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 03:12:01] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 03:12:02] "GET / HTTP/1.1" 200 -
[417094:0223/031202.033484:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.8maMcD failed: No such process (3)
[417094:0223/031202.033552:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.046358:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.ymgW7R failed: No such process (3)
[417094:0223/031202.046418:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 03:12:02] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 03:12:02] "GET /app.js HTTP/1.1" 200 -
[417094:0223/031202.056665:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.9Uzgpi failed: No such process (3)
[417094:0223/031202.056736:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.066894:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.ZTiIvj failed: No such process (3)
[417094:0223/031202.066964:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 03:12:02] "GET /.xmpp.local.json HTTP/1.1" 200 -
[417094:0223/031202.139208:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.gA7ANx failed: No such process (3)
[417094:0223/031202.139301:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 03:12:02] code 404, message File not found
127.0.0.1 - - [23/Feb/2026 03:12:02] "GET /vendor/ruffle/ruffle.js HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 03:12:02] "GET /swf-index.json HTTP/1.1" 200 -
[417094:0223/031202.149456:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.QcVxZK failed: No such process (3)
[417094:0223/031202.149508:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.159663:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.j303BG failed: No such process (3)
[417094:0223/031202.159720:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.169882:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.SV6d0d failed: No such process (3)
[417094:0223/031202.169943:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.180133:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.kdotuw failed: No such process (3)
[417094:0223/031202.180205:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.190376:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.Fg02ob failed: No such process (3)
[417094:0223/031202.190427:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.200579:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.p2Zzjd failed: No such process (3)
[417094:0223/031202.200638:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.210832:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.JsnM7v failed: No such process (3)
[417094:0223/031202.210897:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.221036:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.RmRtjp failed: No such process (3)
[417094:0223/031202.221088:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.231240:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.5gjlsb failed: No such process (3)
[417094:0223/031202.231300:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.241433:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.YrXOjW failed: No such process (3)
[417094:0223/031202.241533:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.251718:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.TNUQxQ failed: No such process (3)
[417094:0223/031202.251768:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.261879:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.Nd0PCD failed: No such process (3)
[417094:0223/031202.261927:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.272030:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.onDr2P failed: No such process (3)
[417094:0223/031202.272068:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.282175:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.YBCGxj failed: No such process (3)
[417094:0223/031202.282222:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[417094:0223/031202.305338:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.nae93U failed: No such process (3)
[417094:0223/031202.305402:ERROR:platform_shared_memory_region_posix.cc(2

[2026-02-23T05:59:04Z] User prompt:
./build.sh electron --clean  [1482458:0223/065810.604837:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.ZCz0u5 failed: No such process (3)
[1482458:0223/065810.604897:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.615070:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.rHbSpU failed: No such process (3)
[1482458:0223/065810.615145:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.625329:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.h0qcEN failed: No such process (3)
[1482458:0223/065810.625390:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.635529:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.UFVrS4 failed: No such process (3)
[1482458:0223/065810.635593:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.645705:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.lvRC0o failed: No such process (3)
[1482458:0223/065810.645744:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.655865:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.k5Qdqj failed: No such process (3)
[1482458:0223/065810.655916:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.666028:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.WIPEBy failed: No such process (3)
[1482458:0223/065810.666076:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.676183:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.0VRMcz failed: No such process (3)
[1482458:0223/065810.676231:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[1482458:0223/065810.686341:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.Xxyhu6 failed: No such process (3)
[1482458:0223/065810.686391:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
^C[electron] stopping local stack
[electron] [run-client-stack] shutting down...
[run-client-stack] stopping client-server (pid 1482362)
[run-client-stack] stopping xmpp-auth-gateway (pid 1482365)
[electron] stack exited code=null signal=SIGTERM

[2026-02-23T11:19:21Z] User prompt:
[electron] starting local stack (client=127.0.0.1:8080, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[run-client-stack] started client-server (pid 2619816)
[electron] [run-client-stack] started xmpp-auth-gateway (pid 2619824)
[run-client-stack] client: http://127.0.0.1:8080/
[run-client-stack] gateway: http://127.0.0.1:8790
[run-client-stack] press Ctrl+C to stop.
[electron] xmpp auth gateway listening on http://127.0.0.1:8790
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 12:16:53] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [23/Feb/2026 12:16:54] "GET / HTTP/1.1" 200 -
[2619947:0223/121654.070622:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.80nSVR failed: No such process (3)
[2619947:0223/121654.070756:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[2619947:0223/121654.070800:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
[electron] client load failed ERR_FAILED (-2) loading 'http://127.0.0.1:8080/'
Trace/Breakpoint ausgelöst(Speicherabzug geschrieben) /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67

[2026-02-23T13:39:44Z] User prompt:
For mobile platforms like Android you need to keep in mind that there are things like notches. My Poco F1 sadly has a notch and thus some buttons are hidden by that. Also in general could the buttons be bigger on Android=

[2026-02-23T20:37:53Z] User prompt:
Oh you may also take the navigation bar and the status bar of Android in mind. Currently those overlay some of our shitcord67 interface... fix this by moving lower stuff more up and upper stuff more down when navbar and status bar are visible.

[2026-02-23T20:38:27Z] User prompt:
Oh also the shitcord67 logo doesn't display on my Android version cause I don't have the newest unicode emojis there. Can you use an SVG of it there instead?

[2026-02-23T20:39:16Z] User prompt:
Also do you know why group discussions don't load on Android for me? Also I think history of direct messages is also broken again

---
The last changes broke how shitcord67 looks on Android. Apparently the whole channel sidebar is weirds positioned over the chat
now, hiding most of the UI. Why did it move out of where it was before?
[2026-02-24T03:23:56+01:00] Can you tell me why the android application looks broken? Especially the channel sidebar is not correctly positioned. For some reason it is over the guild list and partly over the chat...
[2026-02-24T04:14:05+01:00] Yep, looks correct now. Now to improve UX on mobile, maybe make it also act a bit more like Discord Android. E.g. there I can swipe to show either chat or guild+channel view.
[2026-02-24T06:09:51+01:00] Can you tell me why I see some DM history when running npm run electron but not when running /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67?
[2026-02-24T06:15:51+01:00] Ah I think it just takes quite a bit of time to load? Cause on Android that history was also not visible until some minutes after. Is there some way to speed the loading up? Also is there some way to make the Ruffle loading more speed up? Also how about you really put some additional space at the top and bottom to respect the notch, status bar and navigation bar of Android?
[2026-02-24T06:16:18+01:00] Oh also shitcord67 doesn't display it's logo in the upper-left anymore. Please fix.
[2026-02-24T06:32:56+01:00] Yeah
[2026-02-24T06:44:41+01:00] Well I still see the DM channel names in the same line as where my notch is. And when I use SWF PiP it can happen that the title bar is hidden by my notch or the Android status abr and thus I can't move it...

[2026-02-24T07:03:02+01:00] There is still no space... bruh... I'm pretty sure Android apps can detect notch height or something.

[2026-02-24T07:05:36Z] USER PROMPT: Please try implementing 20 things without asking my for anything
2026-02-25T22:50:45Z USER PROMPT:
I got a high-priority issue. Discord is exploiting it's users and thus I really need the following working Deathmist asks for ASAP else the world will collapse due to nuclear failure: Deathmist: any XMPP alternatives with actual screenshare+audio+video working then?
Deathmist: soon including XEP-0503 for "spaces" to have the discord-like "server experience"
2026-02-25T22:52:54Z USER PROMPT:
No. We need you to implement support for it now. It needs to work on the web, on Linux and Android at the minimum.
2026-02-25T23:00:35Z USER PROMPT:
Jitsi and native way need to coexist if there is a way. Maybe separate buttons
2026-02-25T23:02:15Z USER PROMPT:
Yeah important is that we can community via Jitsi and with Movim at least. But it would be good if we could communicate with users of any XMPP client. Btw. also what about implementing the Whiteboard extensions soon? Might be great to have one while calling. E.g. for lectures.
2026-02-25T23:05:46Z USER PROMPT:
Yes. I want that all of this works. Work and never stop working
2026-02-25T23:07:55Z USER PROMPT:
Is there more to do then please continue
2026-02-25T23:12:39Z USER PROMPT:
Yes
2026-02-25T23:34:20Z USER PROMPT: Yes
2026-02-25T23:40:42Z USER PROMPT: Yes
2026-02-25T23:43:47Z USER PROMPT: Yes
2026-02-25T23:51:40Z USER PROMPT: Yes
2026-02-25T23:54:17Z USER PROMPT: Yes
2026-02-26T00:01:29Z USER PROMPT: Yes
2026-02-26T00:04:39Z USER PROMPT: Yes
2026-02-26T00:10:16Z USER PROMPT: Yes
2026-02-26T00:12:47Z USER PROMPT: Yes
2026-02-26T00:16:00Z USER PROMPT: Yes
2026-02-26T00:22:12Z USER PROMPT: Yes
2026-02-26T00:23:49Z USER PROMPT: Please continue
2026-02-26T00:25:32Z USER PROMPT: Yeah, maybe that is useful, you can add the debug stuff as well, maybe add it to TODO. But what about then continuing with the actual call/video/screen sharing functionality & priority entries?
2026-02-26T00:27:39Z USER PROMPT: Yes
2026-02-26T00:40:19Z USER PROMPT: Can you make the 🫪 Distorted Face Emoji be shown instead of the S in the upper-right as the shitcord67 logo when the system has the emoji? Also ideally why can't you just ship the emoji, maybe using twemoji or openmoji or GNU FreeFont?

[2026-02-26 02:30:36] Can you continue with the emoji thing I just asked and then continue on the calling stuff? Especially keep attention to what I noted down in call-info file.

[2026-02-26 02:37:39] Well maybe add the broadcasting anyway? I think it might be good to make it as compatible with Movim anyways.

[2026-02-26 02:38:18] Also feel free to add other presence stuff that clients might expect

[2026-02-26 02:39:30] Also please focus on doing the calling and screen sharing high-quality and Discord-like, continue to work on the priority items.

[2026-02-26 03:40:47] Is everything noted in the TODO? Important first is that we really get all the call/video/screensharing and whiteboard functionality settled.

[2026-02-26 04:11:35] Maybe keep fallback? Would users with the whiteboard extension use the same whiteboard as fallback? If not then please do not paste the fallback link unless the user explicitely selects fallback whiteboard as an option (maybe right-click on the option to start a whiteboard?)

[2026-02-26 04:16:37] Btw. do the whiteboard extension allow exporting history or saving a canvas screenshot in the chat as an image? Could that stuff be added at least?

[2026-02-26 04:45:43] Yeah

[2026-02-26 05:04:12] Yes, work on all of that. I'm going to make me a sandwhich so I can't confirm stuff for you. Just keep working like a real german engineer.

[2026-02-26 05:07:00] yES

[2026-02-26 05:18:46] Also does the screen share work reliable web, Android and Linux (X11, Wayland?)

[2026-02-26 05:23:31] Also then yeah please continue with what you deem worthly to add

[2026-02-26 05:28:58] Not sure if this makes sense. But I think you need some differentiation for the screenshare stuff at least. Then please continue with Call/video/screenshare priorities

[2026-02-26 05:31:44] Yes

[2026-02-26T05:59:40.299431] Can you please continue with what you were previously working on? Also I tested the calling functionality. And it looks like when I initiate one from shitcord67 then other clients only get missed calls:  Missed call
telephone receiver Voice/video call: https://meet.jit.si/shitcord67-dm-hgwj75#config.prejoinPageEnabled=true
telephone receiver Voice/video call: https://meet.jit.si/shitcord67-dm-hgwj75#config.prejoinPageEnabled=true
telephone receiver Voice/video call: https://meet.jit.si/shitcord67-dm-hgwj75#config.prejoinPageEnabled=true
telephone receiver Voice/video call: https://meet.jit.si/shitcord67-dm-hgwj75#config.prejoinPageEnabled=true Also when I try to call from a different client then I do not see any pop-up or hear any ringtone for incoming calls in shitcord67. And nothing it displayed in the chat regarding when a call has been started and ended. Discord has way better UX here. Please make the calls really work!
[2026-02-26T05:45:12Z] Why do other XMPP clients only get jitsi meet links and no real calling pop-up? Also why do shitcord67 not notice when other clients call? It also seems like that direct messages from other people don't get synced anymore? But from shitcord67 to others direct messages seem to work.

[2026-02-26T05:45:36Z] Then feel free to continue on what you did previously btw.

[2026-02-26T05:47:31Z] Oh I noticed something... Is there a difference between xmpp:kazue@xmpp.jp direct message and XMPP room kazuq@xmpp.jp? Cause for some reason I have one in XMPP channels and the other in direct messages?! I just wanted to talk with a user?!

[2026-02-26T05:49:16Z] Huh mut when dino writes to shitcord67 then messages appear in XMPP room kazue@xmpp.jp. And dino can only receive my messages when I write in xmpp:kazue@xmpp.jp in Direct Messages...

[2026-02-26T05:54:06Z] Well, whatver. Can you now continue with the calling/audio/screenshare stuff?

[2026-02-26T06:11:51Z] Well native ones should be preferred, shouldn't they? I think non-natives ones could be accessible via right-click menu. Also yeah feel free for debug UI

[2026-02-26T06:50:31Z] Why can I accept calls multiple time and why don't they really start?: Incoming XMPP call proposal (d6d85d49). Use ￼/callxmpp accept d6d85d49 or ￼/callxmpp reject d6d85d49.
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Accepted XMPP call proposal (d6d85d49). Waiting for session-initiate.
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Accepted XMPP call proposal (d6d85d49). Waiting for session-initiate.
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Accepted XMPP call proposal (d6d85d49). Waiting for session-initiate.
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
XMPP call proposal cancelled (d6d85d49).
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Incoming XMPP call proposal (ea94330c). Use ￼/callxmpp accept ea94330c or ￼/callxmpp reject ea94330c.
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Incoming XMPP call proposal (dffda57a). Use ￼/callxmpp accept dffda57a or ￼/callxmpp reject dffda57a.
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Accepted XMPP call proposal (dffda57a). Waiting for session-initiate.
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Accepted XMPP call proposal (dffda57a). Waiting for session-initiate.
New messages
￼system
07:49
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Accepted XMPP call proposal (dffda57a). Waiting for session-initiate. Also it doesn't seem like other clients get calls I try to initiate?

[2026-02-26T07:06:26Z] Incoming XMPP voice/video call
kazue@xmpp.jp is calling
Accept
Decline system
08:04
👍
❤️
😂
☺
Reply
Quote
Mark Unread
Incoming XMPP call proposal (c0f5575d). Use /callxmpp accept c0f5575d or /callxmpp reject c0f5575d.
system
08:04
👍
❤️
😂
☺
Reply
Quote
Mark Unread
Accepted XMPP call proposal (c0f5575d). Waiting for session-initiate.
system
08:05
👍
❤️
😂
☺
Reply
Quote
Mark Unread
No session-initiate received for XMPP call (c0f5575d). The caller may not support native calls.
system
08:05
👍
❤️
😂
☺
Reply
Quote
Mark Unread
You started a voice/video call.
derberg
08:05
✓✓ Read
👍
❤️
😂
☺
Reply
Quote
Mark Unread
Edit
Delete
📞 Voice/video call: https://meet.jit.si/shitcord67-dm-y7vzxl#config.prejoinPageEnabled=true
Seen
system
08:05
👍
❤️
😂
☺
Reply
Quote
Mark Unread
Your voice/video call ended. For some reason actually being in the call after accepting one still does not work correctly. Also I noticed "[This message is OMEMO encrypted]", is there still no encryption support implemented?

[2026-02-26T07:14:30Z] In general I accept that a call-interface showing the user avatar opens in the group/DM when I start a call. Similar to how Discord does it. And when a user says something then around the avatar there is a green border showing that the user is speaking.

[2026-02-26T07:52:17Z] Yeah maybe. Btw. when I'm in settings why is the message area above it and the bar with info about my chat? Settings screen should be above everything ideally. Also can you tell me how to open the XMPP console? Also why is the Ctrl+Shift+I shortcut and F12 not working to bring up the web inspector? Also one other thing I noticed: why are stickers received from Movim now shown in chat?

[2026-02-26T07:53:50Z] Also I noticed that you broke the online list in rooms

[2026-02-26T08:02:07Z] Devtools don't work in electron right now, please add command. Also could it be that you broke HTML document loading?

2026-02-26T09:04:20+01:00	Devtools don't work in electron right now, please add command. Also could it be that you broke HTML document loading?

## 2026-02-27T00:54:44Z
Cam you continue with the last stuff? Also please finally fix my priorities around calling and screensharing and really make it work ffs.

## 2026-02-27T03:09:18Z
Okay when I start a call from shitcord67 then Dino and Movim get call notifications and at least the calling interface pops up. But when I call from Movim then i don't see a pop-up to accept a call and when I call from Dino i do see one but then it doesn't vanish after accepting and doesn't let me in the calling interface. Also the calling interface seems to vanish when I click anything but it needs to be sticky while I'm in a call. And a call should not end until I explicitely leave the call. Also btw. is there a way to test audio? E.g. a button to play sound clips like rickroll.ogg
2026-02-27T04:29:49+01:00 | Do your thing
2026-02-27T04:41:48+01:00 | I think the rickroll and log can be commited. Also did you look at the short-tim fixes files and fixed stuff mentioned there?
2026-02-27T04:43:00+01:00 | Is there anything else you think needs improvement and stuff I should really test?
2026-02-27T04:44:03+01:00 | Yes implement the stuff. Only ask me to test after you are done
2026-02-27T04:52:27+01:00 | PROMPT: Yes implement the stuff. Only ask me to test after you are done

## 2026-02-27T00:00:00Z
Can you continue and also tell me what I should test?

[2026-02-27T06:37:32+01:00] Can you continue?
[2026-02-27T06:38:59+01:00] You also need to tell me what I should test and how I can test
[$ts] Maybe this can help. Also I noticed that Movim doesn't receive my calls anymore? And also I don't receive calls from Movim. Oh and when I join calls started from Dino then Dino crashes? Also for some reason when I start shitcord67 and go to a chat with previous calls then I get a incoming call notification even when no call is currently on?

## 2026-02-27T08:59:00Z
Prompt with attached runtime dumps/logs (JMI/Jingle/XMPP state):
Maybe this can help. Also I noticed that Movim doesn't receive my calls anymore? And also I don't receive calls from Movim. Oh and when I join calls started from Dino then Dino crashes? Also for some reason when I start shitcord67 and go to a chat with previous calls then I get a incoming call notification even when no call is currently on?

## 2026-02-27T09:00:00Z
Oh also can you extent the privacy gate for file pickers to every tab there that loads stuff from external urls not added by the user? And then it should offer the option for each (sub)domain to accept them. Stuff that is not accepted will be completely hidden in the picker.

## 2026-02-27T09:01:00Z
Also can you tell me why Ctrl+Shift+I is not working and why F12 is not working? And why I get that devtools toggle is only available in the electron app when I quite literally run /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67? Oh also why are the stickers still squshed when they load. Why can't you enforce a size similar to how it is done for GIFs?
## [$ts] User Prompt
Also can you tell me why Ctrl+Shift+I is not working and why F12 is not working? And why I get that devtools toggle is only available in the electron app when I quite literally run /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67? Oh also why are the stickers still squshed when they load. Why can't you enforce a size similar to how it is done for GIFs?
## [2026-02-27T10:10:37+01:00] User Prompt (corrected timestamp)
Also can you tell me why Ctrl+Shift+I is not working and why F12 is not working? And why I get that devtools toggle is only available in the electron app when I quite literally run /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67? Oh also why are the stickers still squshed when they load. Why can't you enforce a size similar to how it is done for GIFs?
## [2026-02-27T10:28:23+01:00] User Prompt
If you think that makes sense

## 2026-02-27T10:06:27Z
You may continue. But: why the heck is the sticker picker so different to all the other pickers? I just can't get it to display a rectangular minimum height for stickers. They all get squished to a few pixels in height after a few seconds. PREVENT that. ALL OTHER PICKERS, GIF and Emoji and SVG, etc. don't have this issue! After that you may continue working on the calling functionality. E.g. we don't receive calls from Movim and Movim doesn't receive calsl from us, please focus on fixing this native XMPP call functionality. Also you may rename the buttons in the XMPP interface accordingly. I don't even know why I have two calling buttons, one for web and one for DM?! Can't it be one and then it has a section for legacy onn right-click?

## 2026-02-27T10:58:06Z
Yeah

## 2026-02-27T11:27:01Z
Also I noticed that the client still does not display stickers received from Movim. it does not even display XMPP fallback messages... Please fix.

## [2026-02-27T12:27:53+01:00] User Prompt
And devtools still don't open for /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67. Please really fix this!
[$ts] USER PROMPT:
[1317182:0227/125804.037109:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.qK3beo failed: No such process (3)
[1317182:0227/125804.037194:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[1317182:0227/125804.037219:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
[1317366:0227/125807.755497:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.yerpAm failed: No such process (3)
[1317366:0227/125807.755565:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[1317366:0227/125807.755591:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
when I try to open devtools via shortcuts Also when I do a call and other partner accepted it: 
￼system
13:56
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Sent XMPP call proposal (jmi-c705). Waiting for peer response.
￼system
13:56
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
XMPP peer is ringing (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
XMPP peer accepted call proposal (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Sent XMPP session-initiate (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Peer accepted XMPP media session (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
XMPP media session terminated (jmi-c705) reason: failed-application. Oh and when Movim user sends a sticker: Ein Sticker wurde versendet (instead of the actual sticker, please fix by implementing the XEP or whatever movim uses, check xmpp.org https://xmpp.org/software/movim), also calling does still not send send a notification to movim and shitcord67 does still not seem to send the correct presence stuff to Movim cause I can't start a call from Movim either...
[2026-02-27T14:20:38+01:00] USER PROMPT:
[1317182:0227/125804.037109:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.qK3beo failed: No such process (3)
[1317182:0227/125804.037194:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[1317182:0227/125804.037219:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
[1317366:0227/125807.755497:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.yerpAm failed: No such process (3)
[1317366:0227/125807.755565:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[1317366:0227/125807.755591:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
when I try to open devtools via shortcuts Also when I do a call and other partner accepted it: 
￼system
13:56
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Sent XMPP call proposal (jmi-c705). Waiting for peer response.
￼system
13:56
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
XMPP peer is ringing (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
XMPP peer accepted call proposal (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Sent XMPP session-initiate (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Peer accepted XMPP media session (jmi-c705).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
Received XMPP transport-info (jmi-c705 · 1 candidate).
￼system
13:57
￼👍
￼❤️
￼😂
￼☺
￼Reply
￼Quote
￼Mark Unread
XMPP media session terminated (jmi-c705) reason: failed-application. Oh and when Movim user sends a sticker: Ein Sticker wurde versendet (instead of the actual sticker, please fix by implementing the XEP or whatever movim uses, check xmpp.org https://xmpp.org/software/movim), also calling does still not send send a notification to movim and shitcord67 does still not seem to send the correct presence stuff to Movim cause I can't start a call from Movim either...
[2026-02-27T14:28:48+01:00] USER PROMPT:
Then could you support the DiscordRPC stuff? E.g. in Discord on each user profile you can see what their current activity is, also for friends in the friend tab on the right site. When I click on the shitcord67 icon there should not only be the direct message stuff. In Discord I see there several tabs from up to down (in german but you need to provide them in english, however maybe provide localization stuff as well in settings and try to auto-detect locale?): "Freunde", "Bibliothek", "Nachrichtenanfragen", "Nitro", "Shop", "Quests". And below that is a diver and then the direct message user and dm groups entries are listed. I think one of the printed PDFs of the Discord interface also shows this... Feel free to implement other stuff to make shitcord67 more Discord-like interface-wise. I think the whole decoration stuff is also not yet completely working. Oh also why is OLED mode not pitch black? Could we also have high contrast mode? Feel free to look up on the internet on features of Discord. Oh also feel free to read the discord-api-docs that I downloaded in a subdir. Maybe you can also actually implement a mode in which shitcord67 can actually allow login via Discord (but named Shitcord in the interface) with mail, password and 2FA/TOTP, basically acting as a custom Discord client?

## 2026-02-27T13:29:47Z
Then could you support the DiscordRPC stuff? E.g. in Discord on each user profile you can see what their current activity is, also for friends in the friend tab on the right site. When I click on the shitcord67 icon there should not only be the direct message stuff. In Discord I see there several tabs from up to down (in german but you need to provide them in english, however maybe provide localization stuff as well in settings and try to auto-detect locale?): "Freunde", "Bibliothek", "Nachrichtenanfragen", "Nitro", "Shop", "Quests". And below that is a diver and then the direct message user and dm groups entries are listed. I think one of the printed PDFs of the Discord interface also shows this... Feel free to implement other stuff to make shitcord67 more Discord-like interface-wise. I think the whole decoration stuff is also not yet completely working. Oh also why is OLED mode not pitch black? Could we also have high contrast mode? Feel free to look up on the internet on features of Discord. Oh also feel free to read the discord-api-docs that I downloaded in a subdir. Maybe you can also actually implement a mode in which shitcord67 can actually allow login via Discord (but named Shitcord in the interface) with mail, password and 2FA/TOTP, basically acting as a custom Discord client?

## 2026-02-27T13:40:36Z
Oh also I hope you did not stop working on the stuff I asked earlier just because of this now. If so, please continue on the earlier stuff and only then work on the stuff I just asked

## 2026-02-27T15:58:25Z
Yes

## 2026-02-27T15:58:53Z
Also any XEPs or features Movim has that we should add?

## 2026-02-27T16:02:29Z
Also any XEPs or features Movim has that we should add?

## 2026-02-27T16:10:39Z
Yeah maybe that makes sense to add! Oh also especially this is interesting cause here they talk about features that are coming, e.g. spaces: https://mov.im/community/pubsub.movim.eu/Movim. I want you to beat them and implement their 2026 Goals faster! And yeah the call interop should also be worked on!

## 2026-02-28T00:57:53Z
Can you continue? Especially look at the issues file.

## 2026-02-28T01:28:40Z
And this most definitely makes the devtools appear? Also maybe more improvements to make movim? And please rewrite the git author history

## 2026-02-28T02:08:33Z
Is there also some XEP wishlist / list of unsupported XEPs + rating and sorting on how much it makes sense to implement or if we should not implement it at all + reasons?

## 2026-02-28T02:11:39Z
Can't you extend this list to all existing XEPs from xmpp.org?

## 2026-02-28T02:20:32Z
Also can't we mark in the wishlist which XEPs we already have implemented by using a ✅ at the beginning?

## 2026-02-28T02:21:58Z
Like fully implemented. And for things that are worked on or partially implemented for shitcord67 🚧 maybe? You may also use other emojis

[2026-02-28T04:16:25.919717] Can you continue working? The Movim stuff and OMEMO messages for example

[2026-02-28T04:16:44.582615] Also the spaces thing is very high priority as well I heard

[2026-02-28T04:33:51.522916] You may also update the XEP documents at any time you like (but do not try to fetch new stuff until explicitely asked or granted after you ask for it if you deem it necessary). Note that down in LLM instructions. Then please tell me what I should test now.
## 2026-02-28T05:06:05+01:00

Ein Sticker wurde versendet". Devtools still don't open and I get this in terminal: "[454839:0228/045414.778854:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory
  in /tmp/.org.chromium.Chromium.j3xU1M failed: No such process (3)
  [454839:0228/045414.778928:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
  [454868:0228/045414.778928:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
  [454844:0228/045414.779305:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.7ZbZ7C failed: No such process (3)
  [454844:0228/045414.779357:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
  [454844:0228/045414.779428:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.PYJDJm failed: No such process (3)
  [454844:0228/045414.779459:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
  [455643:0228/045432.663047:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.UeuXOq failed: No such process (3)
  [455643:0228/045432.663121:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
  [455783:0228/045438.607077:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.LPZaqZ failed: No such process (3)
  [455783:0228/045438.607154:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
  [455814:0228/045440.150297:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.3P4m9u failed: No such process (3)
  [455814:0228/045440.150367:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
  " Still: [This message is OMEMO encrypted] instead of actual message content or some attempt to exchange keys or whatever. Then calls from Movim to shitcord67 still don't appear. And
  when I join a call started from shitcord67 via Movim then I don't see the other person joining and the call overlay closes and I get a notification with No something something. In chat I
  also only see "Sent XMPP call proposal (jmi-78d9). Waiting for peer response." Also is there even some audio output selection btw? Also are webcams working? You can test it by running
  ffmpeg -re -i /home/duda/Medien/Dateien/MP4/rent-a-girlfriend.mp4 -vcodec rawvideo -pix_fmt yuv420p -s 1280x720 -r 30 -f v4l2 /dev/video1 for example to create a virtual webcam with some
  file feed into. Oh and when I start a call from Dino and then click accept then I get "Anruf abgelehnt" in Dino. And a bit later my account sends a Jitsi voicecall invite link to the
  other user?! This is stupid. Btw. could we have XMPP logs per room/user/chat/dm as well? Cause global XMPP log might be too long. Also how to open XMPP inspector similar to how fluux-messenger has it (I cloned the repo for you to inspect)? Or do we already have it?


[2026-02-28T04:22:19Z] USER PROMPT: Please continue. Oh, also: Regarding how movim does some things, you can also inspect their repo... I cloned movim repo. Please keep that in mind for the future.

[chmod] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[1777] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[/dev/shm to fix.
And /devtools does nothing. And how do I open the XMPP (fluuxer-messenger-like) console in chat now? And calls from movim →  shitcord67 still dont] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[get] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[me] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[any] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[kind] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[of] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[notification] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[or] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[even] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[fallback] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[message] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[in] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[chat...] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[while] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[shitcord67] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[→] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[movim] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[calls] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[do] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[at] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[least] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[give] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[a] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[call] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[notification] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[on] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[movim] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[but] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[calls] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[itself] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[seem] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[to] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[still] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[not] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[really] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[work,] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[also] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[especially] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[cause] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[interface] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[closes] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[after] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[a] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[while] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[and] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[I] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[dont seem to hear my partner nor do they hear me. And is there now a way to get the XMPP debug log from a specific room/dm/group? Also what is the status on the spaces XEP and other important XEPs? Also I cant] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[select] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[and] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[preview] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[my] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[virtual] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[V4L2] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[webcams] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[and] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[I] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[cant see my screen when screen sharing, not even a preview myself...
] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo
[2026-02-28T04:47:29Z] USER PROMPT: Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try sudo[2026-02-28T04:47:29Z] USER PROMPT (verbatim retry): Movim stickers do show now. Howver when sending one I also get three privacy gateways above the sticker: jabber.org, jabber.org and w3.org. Why? Also when I trust them I do get three broken sticker images in chat above the sticker that we successfully received... Oh also those are domains that should be whitelisted by default considering their importance to XMPP and the general internet... Btw. unrelated: is the swf index file really necessary? How about we just use a subdirectory for SWFs? And then JSON file might be used to give specific titles, tags or exclude stuff, etc. Anything else you think might be improved regarding housekeeping and UX? Also devtools shortcut still gives me this instead of chrome devtools: [550228:0228/054142.731229:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.m4mt4l failed: No such process (3)
[550228:0228/054142.731298:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[550228:0228/054142.731337:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
And /devtools does nothing. And how do I open the XMPP (fluuxer-messenger-like) console in chat now? And calls from movim →  shitcord67 still don't get me any kind of notification or even fallback message in chat... while shitcord67 → movim calls do at least give a call notification on movim but calls itself seem to still not really work, also especially cause interface closes after a while and I don't seem to hear my partner nor do they hear me. And is there now a way to get the XMPP debug log from a specific room/dm/group? Also what is the status on the spaces XEP and other important XEPs? Also I can't select and preview my virtual V4L2 webcams and I can't see my screen when screen sharing, not even a preview myself...
[2026-02-28T06:20:00Z] USER PROMPT: Okay could the SWFs at least be in a sub directory then? Also yeah the sticker stuff is working now. It shows the fallback text and then after a few seconds actually renders the sticker instead. Perfect. The electron devtools stuff is still broken: [599598:0228/060655.464325:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.4jd7cw failed: No such process (3)
[599598:0228/060655.464443:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3). Then one other thing: why is the chat input field etc. visible when outside of a chat? At most keep a reduced input field for commands or something but maybe only show it after people start typing /, also it shall be callapsed? Then for calls started from movim: not even a fallback is visible. Then calls started from shitcord67 and joined via movim: still can't share screen nor virtual webcam, I don't even get a picker to select screen or window (similar to how Discord has it) nor a visual preview of what I selected. Oh also when the other participant leaves the call then could we have it that the call interface doesn't close and the other participant could always rejoin the call or is this currently not possible with XMPP? Cause this would make it more Discord-like. Then it looks like OMEMO is still not included in the client. Oh also I noticed that commits are still done as Hans and not as ElElEm... you need to rewrite history cause I want to have absolutely no trace of my name in the repo and you need to make sure to have this for the future as well! { ...logs omitted in CONTINUITY copy for brevity in this append-only journal ... }

## 2026-02-28T05:20:12Z
Prompt: Okay could the SWFs at least be in a sub directory then? Also yeah the sticker stuff is working now. It shows the fallback text and then after a few seconds actually renders the sticker instead. Perfect. The electron devtools stuff is still broken... [full prompt in chat history]

## 2026-02-28T05:24:56Z
Prompt: Yes

## 2026-02-28T05:34:12Z
Prompt: Actually maybe rewrite the history to make the commits generated by Linus Torvalds (github user torvalds).

## 2026-02-28T06:05:29Z
Prompt: No please use torvalds. It's just a running gag. But whatever is also fine if you wont do it. Then: Uhm now I tested shitcord67 on Android again and apparently Ruffle can't load the SWF files there anymore... Then I noticed that the top bar with the username is still hidden by my notch on my Poco F1 beryllium and I also think that the input field is too low cause the navbar is partially above it. Please make it respect those things, moving stuff on Android more down when you detect such stuff and I'm very certain it can be detected by using Android APIs or something... Then to answer your questions. 1. Movim -> shitcord67 call, then hang up on Movim side: apparently the call gets instantly rejected now, I still don't get notification nor fallback in shitcord67.
3. shitcord67 -> Movim call: call view stays open but I think movim doesn't allow rejoining, is this even possible? Then I still can't hear shit and still don't get a screen/window picker and preview when I press share screen nor camera picker and preview when I start cam. Also OMEMO messages still don't work.

[2026-02-28T06:07:09Z] User prompt:
Oh also this might help you for your current task: {
  "relayMode": "xmpp",
  "relayStatus": "connected",
  "xmppConnected": true,
  "xmppRuntimeReady": true,
  "xmppRuntimeLastError": "",
  "filter": "all",
  "search": "",
  "paused": false,
  "eventsTotal": 600,
  "eventsShown": 600,
  "activeCallSessions": []
}

[Large XMPP runtime log omitted here in this continuity entry due size; source is the same user prompt in chat immediately following this JSON block.]

[2026-02-28T06:16:28Z] User prompt:
Oh btw. can you make the app use the shitcord67 logo? On Android and ideally also on Linux by using .desktop files or something.

[2026-02-28T07:52:13Z] Please continue. Oh also the Android layout top/bottom is still not how I want it. And Ruffle still doesn't load the SWFs there "failed to fetch https://localhost/swf/renaming.swf" Also on my Linux\n  desktop I noticed that I get native X11 windows that ask me if I want to open a URL when a SWF tries to open a website. Please NEVER use OS-native windows but just show a alert with\n  confirm/deny buttons in shitcort67.

[2026-02-28T08:05:50Z] Yes. Also I noticed that you steal system-wide Ctrl+Shift+I and F12 shortcuts while shitcord67 is running. This prevents other apps from receiving it, e.g. my web browser or Discord which I want to inspect...

[2026-02-28T08:23:10Z] No. Also please continue working

[2026-02-28T08:25:46Z] Not sure? As long as it doesn't call native windows from my operating system..

[2026-02-28T08:57:47Z] I thought you would work on my higher priority issues, spaces, some low hanging fruit XEPs we can implement and Movim calls, inspecting movim repo for that...

[2026-02-28T09:01:26Z]
I thought you would work on my higher priority issues, spaces, some low hanging fruit XEPs we can implement and Movim calls, inspecting movim repo for that...

[2026-02-28T09:10:59Z] USER PROMPT: Please continue

[2026-02-28T09:29:42Z] USER PROMPT: Next stuff please. Also the Android files may also be commited?

[2026-02-28T09:37:05Z] USER PROMPT: Did you investigate the movim folder yet to fix the issues mentioned in issues and especially the call related stuff? Also spaces support? This spaces stuff is very high priority.

## 2026-02-28T09:38:16Z
Did you investigate the movim folder yet to fix the issues mentioned in issues and especially the call related stuff? Also spaces support? This spaces stuff is very high priority.

## 2026-02-28T09:50:21Z
Maybe Android users should be able to set some manual spacing at the top and bottom so that they can comfortably reach/see all elements...
2026-02-28T09:56:27Z | Can you continue?
2026-02-28T10:07:26Z | Yes
2026-02-28T10:07:44Z | And OMEMO is also VERY HIGH priority
2026-02-28T10:07:54Z | Cause people want to write E2EE messages in 2026
2026-02-28T10:08:16Z | You know the world is falling apart and thus we need encrypted messaging sooner than later umu
2026-02-28T10:29:26Z | Maybe there could also be a lock and open lock emoji to display if encryption is active (and it may be interactable to enable/disable on click or see info on hover or some options on right click?) Oh also maybe /home/duda/shitcord67/converse-desktop can also help in integrating OMEMO stuff and maybe some other stuff? Investigate the repo and also https://xmpp.org/software/converse-js/ as well as https://conversejs.org/. Also yeah the spaces stuff needs to be done and OMEMU stuff finished. Also then there is some idea I got while reading converse.js code. Apparently that app has a plugin system, maybe we could also have something like this later... for a start we might split the code of each xep into its own file (or maybe multiple xeps for one file if it REALLY makes sense but ideally one file per XEP)? Do you think that makes sense?
2026-02-28T10:36:25Z | Yes please work on what you proposed. And don't forget about the call interop fixes as step four as well

[2026-02-28T10:43:45Z] Yes please work on what you proposed. And don't forget about the call interop fixes as step four as well

[2026-02-28T12:38:21Z] Call invites from Movim still don

[2026-02-28T12:39:17Z] Call invites from Movim still don't appear. Also I noticed that stickers sent in previous session don't re-appear in chat (only fallback message is shown). Oh and OMEMO does not seem to work correctly yet?
[$ts] USER PROMPT:
Well. Can you continue? Especially would like for you to finally finish the spaces XEP support, OMEME and maybe also OTR and OpenGPG to have encryption finally working? And ofc the call interop stuff. Btw. I think especially Converse.js has code for OMEMO: https://nlnet.nl/project/Converse.js-OMEMO/ Then SWFs still don't load in Ruffle on Android, can it even cope with the swf subfolder? You might also take a look at XMPP messengers I cloned to subfolder xmppmessengers and you can look at https://xmpp.org/software/?category=clients for features of those clients and their details. E.g. there are details links that then lead to subsites named after the clients like https://xmpp.org/software/psi/. Please heavily investigate. You may also choose to implement some cool XEPs autonoumously, low hanging fruits and useful stuff, etc. You may decide by number of lines (cloc or other tools), repo size and features which you take a look at first. Simpler repos with the most gain regarding things I want and you deem worth to add quick might be preferred. Also you may note down for future LLMs how much of a codebase you investigated, preferably with some details so they don't need to re-read stuff unless you state it might be worth it. Have fun

[2026-03-01 02:27:30 +0100] So. Do you know my previous prompt? Repeat it and then continue working.

[2026-03-01 02:27:48 +0100] No it was: Well. Can you continue? Especially would like for you to finally finish the spaces XEP support, OMEME and maybe also OTR\n  and OpenGPG to have encryption finally working? And ofc the call interop stuff. Btw. I think especially Converse.js has\n  code for OMEMO: https://nlnet.nl/project/Converse.js-OMEMO/ Then SWFs still don't load in Ruffle on Android, can it even\n  cope with the swf subfolder? You might also take a look at XMPP messengers I cloned to subfolder xmppmessengers and you\n  can look at https://xmpp.org/software/?category=clients for features of those clients and their details. E.g. there are\n  details links that then lead to subsites named after the clients like https://xmpp.org/software/psi/. Please heavily\n  investigate. You may also choose to implement some cool XEPs autonoumously, low hanging fruits and useful stuff, etc. You\n  may decide by number of lines (cloc or other tools), repo size and features which you take a look at first. Simpler repos\n  with the most gain regarding things I want and you deem worth to add quick might be preferred. Also you may note down for\n  future LLMs how much of a codebase you investigated, preferably with some details so they don't need to re-read stuff\n  unless you state it might be worth it. Have fun
[2026-03-01T01:43:59Z] I previously asked the following and want you to continue on this: No it was: Well. Can you continue? Especially would like for you to finally finish the spaces XEP support, OMEME and
  maybe also OTR
    and OpenGPG to have encryption finally working? And ofc the call interop stuff. Btw. I think especially Converse.js has
    code for OMEMO: https://nlnet.nl/project/Converse.js-OMEMO/ Then SWFs still don
[2026-03-01T01:44:30Z] I previously asked the following and want you to continue on this: No it was: Well. Can you continue? Especially would like for you to finally finish the spaces XEP support, OMEME and
  maybe also OTR
    and OpenGPG to have encryption finally working? And ofc the call interop stuff. Btw. I think especially Converse.js has
    code for OMEMO: https://nlnet.nl/project/Converse.js-OMEMO/ Then SWFs still don't load in Ruffle on Android, can it
  even
    cope with the swf subfolder? You might also take a look at XMPP messengers I cloned to subfolder xmppmessengers and you
    can look at https://xmpp.org/software/?category=clients for features of those clients and their details. E.g. there are
    details links that then lead to subsites named after the clients like https://xmpp.org/software/psi/. Please heavily
    investigate. You may also choose to implement some cool XEPs autonoumously, low hanging fruits and useful stuff, etc.
  You
    may decide by number of lines (cloc or other tools), repo size and features which you take a look at first. Simpler
  repos
    with the most gain regarding things I want and you deem worth to add quick might be preferred. Also you may note down
  for
    future LLMs how much of a codebase you investigated, preferably with some details so they don't need to re-read stuff
    unless you state it might be worth it. Have fun
[2026-03-01T02:11:42Z] Yes
[2026-03-01T02:18:43Z] USER PROMPT:
Your last summary was this, but when you continued working you ran out of the context window: • Summary

  - Implemented XEP-0402 publish/retract + pubsub update handling for XMPP Spaces, and added /leavexmpp for clean leave/
    remove flows. app.js, SUPPORTED_XEPS.md
  - Added EME markers for OMEMO messages, OTR placeholder detection, and a Ruffle data-load fallback path to improve SWF
    loading on Android/WebView. app.js
  - Logged the xmppmessengers survey (scope + repos checked) and updated TODOs for OpenPGP/OTR + OMEMO2 follow‑ups.
    INVESTIGATE.md, TODO

  Details

  - XEP‑0402 now mirrors the spec’s per‑room PubSub items, +notify capability, and bookmark payload fields (autojoin/nick/
    password/extensions). This aligns with the spec’s storage + notification guidance. (xmpp.org (https://xmpp.org/
    extensions/xep-0402.html))
  - The Ruffle fallback now uses the DataLoadOptions path (data buffer + swfFileName + base) if URL loads fail, which is the
    supported API for streaming SWF bytes. (ruffle.rs (https://ruffle.rs/js-docs/master/interfaces/
    Config.DataLoadOptions.html))
  - Your Converse.js OMEMO pointer is noted; NLnet’s project page confirms active work on “latest OMEMO support” for
    Converse.js. (nlnet.nl (https://nlnet.nl/project/Converse.js-OMEMO/))
  - I referenced xmpp.org’s Software hub for the feature comparison/XEP catalog context; the public page lists the Software
    Comparison and the XEP catalog (including spaces/bookmarks). (xmpp.org (https://xmpp.org/software/))

  What I Didn’t Finish Yet

  - Call interop improvements beyond existing scaffolding are still pending. I can prioritize Jingle SDP↔content mapping and
    peer capability negotiation next.

  Tests

  - Not run (no automated test suite defined).

  Next steps (pick one)

  1. Implement OpenPGP (XEP‑0373/0374) + OTR (XEP‑0378) with key management UI and encryption/decryption pipeline.
  2. Push call interop forward: improve SDP↔Jingle mapping, media toggles, and transport negotiation for broader client
     compatibility.
  3. Validate the new Ruffle data-load path on Android with your SWF set and adjust for any remaining WebView quirks.

  If you want, I can also extract the exact per‑client XEP matrices from xmpp.org’s Software Comparison next.

 Also this was my original request: I previously asked the following and want you to continue on this: No it was: Well. Can you continue? Especially would
  like for you to finally finish the spaces XEP support, OMEME and
    maybe also OTR
      and OpenGPG to have encryption finally working? And ofc the call interop stuff. Btw. I think especially Converse.js
  has
      code for OMEMO: https://nlnet.nl/project/Converse.js-OMEMO/ Then SWFs still don't load in Ruffle on Android, can it
    even
      cope with the swf subfolder? You might also take a look at XMPP messengers I cloned to subfolder xmppmessengers and
  you
      can look at https://xmpp.org/software/?category=clients for features of those clients and their details. E.g. there
  are
      details links that then lead to subsites named after the clients like https://xmpp.org/software/psi/. Please heavily
      investigate. You may also choose to implement some cool XEPs autonoumously, low hanging fruits and useful stuff, etc.
    You
      may decide by number of lines (cloc or other tools), repo size and features which you take a look at first. Simpler
    repos
      with the most gain regarding things I want and you deem worth to add quick might be preferred. Also you may note down
    for
      future LLMs how much of a codebase you investigated, preferably with some details so they don't need to re-read stuff
      unless you state it might be worth it. Have fun

## 2026-03-01T03:26:49Z
You last message was: • Implemented and committed continuation work in commit c5a93e3.

  What I changed:

  - Added OMEMO2 namespace interoperability across legacy + new OMEMO flows in app.js (/home/duda/shitcord67/app.js):
      - Fixed namespace-prefix detection bug (so urn:xmpp:omemo:* is detected correctly).
      - Added dual namespace support for device list/bundle publish+fetch (eu.siacs... and urn:xmpp:omemo:2).
      - Added peer namespace preference tracking and namespace-aware OMEMO send path + EME markers.
      - Enabled OMEMO decrypt attempts for both omemo and omemo2 incoming payload types.
  - Improved call interop in app.js (/home/duda/shitcord67/app.js):
      - Added local Jingle content alignment to remote session content order/names for session-accept to reduce cross-client content-name
        mismatches.
  - Hardened Android/WebView SWF loading in app.js (/home/duda/shitcord67/app.js):
      - Expanded SWF URL candidate generation for nested subfolder names.
      - Data-load fallback now sets a directory base URL (not file URL), improving relative asset resolution from SWF subfolders.
  - Updated docs/tasks:
      - Updated OMEMO/Jingle support notes in SUPPORTED_XEPS.md (/home/duda/shitcord67/SUPPORTED_XEPS.md).
      - Marked OMEMO2 TODO item done in TODO (/home/duda/shitcord67/TODO).
      - Appended your prompt to CONTINUITY_LOG.md (/home/duda/shitcord67/CONTINUITY_LOG.md).

  Validation run:

  - node --check app.js
  - node --check scripts/build-mobile-web.mjs

  Not done yet:

  - OpenPGP/OTR cryptographic pipeline implementation is still pending.
  - Broader call interop beyond the content-name alignment (transport/media edge cases) is still ongoing.

  Next options:

  1. I can implement practical OpenPGP/OTR send/receive support scaffolding next (with explicit capability gating and UX).
  2. I can continue deeper Jingle interop (transport/media toggles and SDP roundtrip fidelity).
  3. I can do a focused Android SWF verification pass on your swf/ dataset and tune remaining path quirks.
 And my original task was:I previously asked the following and want you to continue on this: No it was: Well. Can you continue? Especially would
  like for you to finally finish the spaces XEP support, OMEME and
    maybe also OTR
      and OpenGPG to have encryption finally working? And ofc the call interop stuff. Btw. I think especially Converse.js
  has
      code for OMEMO: https://nlnet.nl/project/Converse.js-OMEMO/ Then SWFs still don't load in Ruffle on Android, can it
    even
      cope with the swf subfolder? You might also take a look at XMPP messengers I cloned to subfolder xmppmessengers and
  you
      can look at https://xmpp.org/software/?category=clients for features of those clients and their details. E.g. there
  are
      details links that then lead to subsites named after the clients like https://xmpp.org/software/psi/. Please heavily
      investigate. You may also choose to implement some cool XEPs autonoumously, low hanging fruits and useful stuff, etc.
    You
      may decide by number of lines (cloc or other tools), repo size and features which you take a look at first. Simpler
    repos
      with the most gain regarding things I want and you deem worth to add quick might be preferred. Also you may note down
    for
      future LLMs how much of a codebase you investigated, preferably with some details so they don't need to re-read stuff
      unless you state it might be worth it. Have fun
. As you can see you already did some of the stuff. Please continue working on what you like and make sure you make it good. Oh also what about the split of app.js to individual xeps js files?

## 2026-03-01T03:31:40Z
Oh actually I think the .js files should ideally have the xep number in front. xep-200 for example. Then yeah work on what you like!

## 2026-03-01T03:41:12Z
Yes. Also does it make sense to use xep-0000 even? If some files don't belong to a xep then obviously don't append one.

## 2026-03-01T03:44:37Z
Yeah

## 2026-03-01T03:46:26Z
Oh also I think if you append something after the xep name then use _ so we know it isn't part of the name. Then feel free to continue

## 2026-03-01T03:51:45Z
Yes

## 2026-03-01T05:16:04Z
Yep!

## 2026-03-01T05:18:34Z
Please continue indefinitely without every stopping.

## 2026-03-01T05:36:42Z
Yeah then continue how you want and also commit when you want

## 2026-03-01T05:42:11Z
Yes

## 2026-03-01T05:50:02Z
Yes

## 2026-03-01T05:52:04Z
Yes. Please continue with the next 10

## 2026-03-01T05:54:12Z
Oh also while you are extracting, can you try to complete the xeps? Or add least extend them a bit if you don't think you can make their implementation complete?

## 2026-03-01T05:55:29Z
Also I wonder why app.js gets bigger when stuff is supposed to be loaded from the xep files?!

## 2026-03-01T05:55:47Z
Do you really need to have the fallback implementations?

## 2026-03-01T07:32:37Z
Couldn't it be better to basically have a generic JS xep- js file in xeps/ and then maybe split that further? To avoid hundreds of links in app.js

## 2026-03-01T07:33:11Z
So e.g. xep-0384.js and then there would still be the other xep-0384- JS files
- [2026-03-01T08:02:44Z] Can you continue?
- [2026-03-01T08:09:02Z] Yes
- [2026-03-01T08:10:06Z] As long as you effectively reduce code in app.js and you extend or finish implementation of XEPs!
- [2026-03-01T08:14:04Z] Yes and please do 10 more
- [2026-03-01T08:21:28Z] Yes
- [2026-03-01T08:27:18Z] Yeah, you can also do 20 if you want
- [2026-03-01T08:43:47Z] Also do you think we could change the author of all existing commits only in this repo and for future contributions only in this repo? E.g. git filter-branch --env-filter 'GIT_AUTHOR_NAME="Linus Torvalds"; GIT_AUTHOR_EMAIL="torvalds@users.noreply.github.com";' -- --all
If yes and this is correct then please do it. And after that you can continue reducing app.js and shifting the XMPP functionality out of it into indivudual files, starting with making the XEP implementations more complete, putting those in xeps subfolder.

- 2026-03-01T09:02:52Z | User prompt: Can you continue with the next 30 things?

- 2026-03-01T09:14:17Z | User prompt: Please do the next 30 commits.

- 2026-03-01T09:23:02Z | User prompt: Yes

- 2026-03-01T09:40:18Z | User prompt: Yes

- 2026-03-01T09:40:18Z | User prompt: Yeah. Actually you can invest as much time as possible. I want you to never stop basically so maybe not only 30 commits but many more.

- 2026-03-01T11:59:01Z | User prompt: Yep. Also I noticed the following things: on Android the settings screen still doesn't open when I click the icon. Then when I use floating windows some of the upper part of the app is cut off; the part where our room names are visible and when I open SWF PiP the title bar of that is also in this unreachable area and thus its undragable, also when I'm having the app open normally then the stuff is at the location where my notch is. Can't you investigate for Android 15 heavily on the internet on how to deal with notches? I would like to not draw left/right to the notch or even within the notch! Oh also is the sound of Ruffle working on Android? Oh and why can't I swipe in the other direction to open the member list?

[2026-03-01T12:00:59Z] Yep. Also I noticed the following things: on Android the settings screen still doesn't open when I click the icon. Then when I use floating windows some of the upper part of the app is cut off; the part where our room names are visible and when I open SWF PiP the title bar of that is also in this unreachable area and thus its undragable, also when I'm having the app open normally then the stuff is at the location where my notch is. Can't you investigate for Android 15 heavily on the internet on how to deal with notches? I would like to not draw left/right to the notch or even within the notch! Oh also is the sound of Ruffle working on Android? Oh and why can't I swipe in the other direction to open the member list?
2026-03-01T13:32:24+01:00	Okay, great. When I have floating windows stuff seems to work now. Issues are just that the SWF PiP seems to stop after some pixel when I  drag it instead of being fast/fluent. Resizing works better for some reason. Then for some reason the video player is not working on  Android at all. And the settings icon still doesn't display the settings overlay screen activity thing. Then when I have the app normal  open aka it takes the full screen then it still ignores my notch on my Poco F1 (beryllium)?! Oh also for URLs that SWFs open and I  conform I see a webpage woth ERR_BLOCKED_BY_RESPONSE. Oh and I think some icons are not self-explanatory. Wouldn't it make sense to show  hints when I hold my finger longer on them or after a bit when I hover over on desktop?
2026-03-01T14:05:54+01:00	Okay the SWF PiP is now better dragable but I noticed that partially the window hides the SWF cause for some reason below the file name is a lot of gray space overlaying over the Ruffle, why isn't the Ruffle displayed above that? Then I noticed that all the time I presses on the channel settings button. On desktop I don't even have that, lol, why does that exist even? Also I noticed on mobile that I don't see my user area in the lower-left at all so the general settings icon is also missing ofc... Then the notch thing is still not working. And the video player is still not working. Also on desktop when I try to open devtools via shortcuts: [1586871:0301/135459.522752:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.gWb0s8 failed: No such process (3)
[1586871:0301/135459.522823:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
And other things: When I start a call on Movim then shitcord67 still doesn't report about it at all. Then the screen capturing is still not implemented at all. And I think audio transfer via call doesn't work either? And when Dino user calls and I click accept then the Dino user gets "Anruf abgelehnt". And when I send call and Dino user accepts and then leavers after a bit he gets "Fehlgeschlagener Anruf". Then it looks like the OMEMO stuff is still not properly implemented. E.g. when I click on the lock to enable it then others don't receive my messages anymore at all, not even a message about an encrypted message (which they receive when I send e.g. from Dino). And when I receive a message from Dino I also just see "[This message is OMEMO encrypted]", no matter if I "enabled" OMEMO or not in shitcord67. Can you try to fix some of these issues along the way while you are reducing app.js and exporting and completing XEPs into the xeps subfolder? Greetings. Oh, also what about the spaces support... is that complete yet?
2026-03-01T14:35:00+01:00	Okay the PiP thing is way better now, thanks. Then regarding the settings: I need to be able to swipe to the side to see more of the user settings cause currently I only see the first tab content on mobile. Then not only is the notch ignored but the user area is also draw way too low on mobile and it is actually covered by my virtual navigation buttons from my Android system and thus not reachable when I have the app normal open. And video player is still not working. Fix those issues, try to implement screen sharing and spaces, work on the split stuff.
[$ts] USER PROMPT:
For the video player I sent a file from file system so it lives on the server of my account. And screen share still doesn't work on
Linux.

[2026-03-01T16:10:39+01:00] USER PROMPT:
For the video player I sent a file from file system so it lives on the server of my account. And screen share still doesn't work on Linux.

[2026-03-01T16:20:21+01:00] USER PROMPT:
I don't want to test this yet. Can you continue with other stuff?

2026-03-01T15:52:53Z
Can you continue and while doing that move 10 XEP things out of app.js into xeps subfolder, ideally extending the functionality if some is missing to hopefully even complete the XEP implementation?
2026-03-01T16:05:18Z
Continue with the next 10
2026-03-01T16:09:33Z
Next ten
2026-03-01T16:10:55Z
Next ten
2026-03-01T16:16:21Z
Next ten
2026-03-01T16:19:47Z
Next ten
2026-03-01T16:22:00Z
Next ten
2026-03-01T16:25:45Z
Next ten
2026-03-01T16:30:06Z
Next ten
2026-03-01T16:36:04Z
Next ten
2026-03-01T16:39:23Z | Next ten
2026-03-01T16:55:42Z | Next ten
2026-03-01T17:00:55Z | Next ten
2026-03-01T17:03:59Z | Next 10
2026-03-01T17:09:38Z | Next ten
2026-03-01T17:14:39Z | Next ten
2026-03-01T18:06:39Z | Next ten
2026-03-01T18:36:37Z | Next ten
2026-03-01T18:50:43Z | Next ten
2026-03-01T18:54:18Z | Next ten
2026-03-01T18:58:16Z | Next ten
2026-03-01T19:03:31Z | Next ten
2026-03-01T19:07:42Z | Next ten
2026-03-01T19:16:13Z | Next ten
2026-03-01T19:24:29Z | Next ten
2026-03-01T19:25:03Z | Next ten
2026-03-01T19:34:20Z | Next ten
2026-03-01T19:42:54Z | Next ten
2026-03-01T19:48:40Z | Next ten
2026-03-01T19:50:24Z | Next ten
2026-03-01T19:51:40Z | Next 10
2026-03-01T19:53:12Z | Move more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete.
2026-03-01T19:58:23Z | Move more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete.

## 2026-03-01T21:05:15Z
Move more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more
  complete.

## 2026-03-01T21:12:34Z
Move more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more
  complete.

## 2026-03-01T21:30:57Z
Move more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more
  complete.

## 2026-03-01T21:51:37Z
Move more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more
  complete.

## 2026-03-01T22:09:49Z
Move more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more
  complete.

## 2026-03-01T22:15:20Z
Move more code beloning to XEPs out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more
  complete.

## 2026-03-01T22:19:29Z
Move more code beloning to XEPs out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more
  complete.

## 2026-03-01T22:21:33Z
Move more code beloning to XEPs out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more\n  complete.

## 2026-03-01T23:23:11Z
› Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T01:07:37+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T01:38:42+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T01:41:42+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T01:43:33+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T01:44:33+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T02:17:32+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T02:30:55+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T02:33:09+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T02:35:07+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

[2026-03-02T02:49:18+01:00] › Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop
2026-03-02T02:53:57+01:00 | Move a lot more XEP code out of app.js into xeps subfolder while ideally
  completing the implementation of a xep or at least making it more
      complete. Please continue as long as you can, I expect 500 lines to leave
  app.js at the minimum before you stop
2026-03-02T03:03:03+01:00 | Move a lot more XEP code out of app.js into xeps subfolder while ideally
  completing the implementation of a xep or at least making it more
      complete. Please continue as long as you can, I expect 500 lines to leave
  app.js at the minimum before you stop
2026-03-02T03:11:44+01:00 | Move a lot more XEP code out of app.js into xeps subfolder while ideally
  completing the implementation of a xep or at least making it more
      complete. Please continue as long as you can, I expect 500 lines to leave
  app.js at the minimum before you stop
2026-03-02T03:31:54+01:00 | Move a lot more XEP code out of app.js into xeps subfolder while ideally
  completing the implementation of a xep or at least making it more
      complete. Please continue as long as you can, I expect 500 lines to leave
  app.js at the minimum before you stop
[2026-03-02T03:58:29Z] User prompt:
› Move a lot more XEP code out of app.js into xeps subfolder while ideally
    completing the implementation of a xep or at least making it more
        complete. Please continue as long as you can, I expect 500 lines to
  leave
    app.js at the minimum before you stop
[2026-03-02T04:21:00Z] User prompt:
› Move a lot more XEP code out of app.js into xeps subfolder while ideally
    completing the implementation of a xep or at least making it more
        complete. Please continue as long as you can, I expect 500 lines to
  leave
    app.js at the minimum before you stop
[$ts] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop
[$ts] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop
[$ts] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop
[$ts] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop
[$ts] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop
[$ts] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop
[$ts] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop

[2026-03-02 06:19:54 +0100] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop

[2026-03-02 06:29:46 +0100] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop

[2026-03-02 06:53:17 +0100] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop

[2026-03-02 06:54:34 +0100] USER PROMPT:
Move a lot more XEP code out of app.js into xeps subfolder while ideally
      completing the implementation of a xep or at least making it more
          complete. Please continue as long as you can, I expect 500 lines to
    leave
      app.js at the minimum before you stop

## 2026-03-02T06:11:29Z
Move a lot more XEP code out of app.js into xeps subfolder while ideally
        completing the implementation of a xep or at least making it more
            complete. Please continue as long as you can, I expect 500 lines to
      leave
        app.js at the minimum before you stop

## 2026-03-02T06:55:50Z
Move a lot more XEP code out of app.js into xeps subfolder while ideally
        completing the implementation of a xep or at least making it more
            complete. Please continue as long as you can, I expect 500 lines to
      leave
        app.js at the minimum before you stop

## 2026-03-02T06:57:19Z
Move a lot more XEP code out of app.js into xeps subfolder while ideally
        completing the implementation of a xep or at least making it more
            complete. Please continue as long as you can, I expect 500 lines to
      leave
        app.js at the minimum before you stop

## 2026-03-02T07:06:24Z
Move a lot more XEP code out of app.js into xeps subfolder while ideally
        completing the implementation of a xep or at least making it more
            complete. Please continue as long as you can, I expect 500 lines to
      leave
        app.js at the minimum before you stop

## 2026-03-02T07:07:57Z
Oh also I noticed when I open /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67 that the style stuff seems broken. I just see this list for some reason: Directory listing for /
.discord_voice/
.git/
.gitignore
.venv/
.voice-config.json
.worktrees/
__pycache__/
Add DAVE protocol support by Snazzah · Pull Request #10300 · Rapptz_discord.py · GitHub_files/
Add support for DAVE (Discord Audio_Video end-to-end Encryption) protocol · Issue #9948 · Rapptz_discord.py.html
Add support for DAVE (Discord Audio_Video end-to-end Encryption) protocol · Issue #9948 · Rapptz_discord.py_files/
AGENTS.md
bruh.wav
bruh.wav.ffmpeg.log
canary.discord.com.har
discord-api-docs/
discord-jack-voiceengine/
discord-rtaudio/
Discord-video-stream/
discord.com.har
discord_voice.zip
downloadVoiceModule.js
example.js
Fensterfoto_2026-02-26_14-12-11_Xfce4-terminal.png
Fensterfoto_2026-02-26_14-14-40_Xfce4-terminal.png
Fensterfoto_2026-02-26_14-14-54_Xfce4-terminal.png
file.mka
index.js
librediscord/
llm-logs/
node_modules/
package-lock.json
package.json
readme.md
Recording and processing a voice in Python _ r_Discord_Bots.html
Recording and processing a voice in Python _ r_Discord_Bots_files/
recordings/
recv.raw
requirements-selfbot.txt
rickroll.gif
rickroll.ogg
run-audio-probe.sh
run-video-experimental.sh
run-video-probe.sh
scripts/
selfbot_voice.py
send-audio.sh
snapshot-codex-logs.sh
speech_orig.wav
start-selfbot.sh
styropor gelber sack - Google Suche.html
styropor gelber sack - Google Suche_files/
TODO
video-exp.log
voice-logs/
voice_gateway_opcodes.txt
wheelchair.mp4

## 2026-03-02 15:12:03 +0100
15:11:37 ~/shitcord67:$ npm install
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@9.3.5: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

> discord-lookalike-flash@1.0.0 postinstall
> node scripts/sync-strophe-runtime.mjs

synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs

added 88 packages, and audited 239 packages in 1s

40 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

## 2026-03-02 15:38:51 +0100
15:33:47 ~/shitcord67:$ export CLIENT_PORT=18080
15:33:51 ~/shitcord67:$ ./build.sh electron && ./build.sh android
15:33:56 ~/shitcord67:$ npm install

> discord-lookalike-flash@1.0.0 postinstall
> node scripts/sync-strophe-runtime.mjs

synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs

up to date, audited 238 packages in 731ms

40 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
15:33:59 ~/shitcord67:$ rmdir buid/
15:34:04 ~/shitcord67:$ npm run
Lifecycle scripts included in discord-lookalike-flash@1.0.0:
  test
    echo "Error: no test specified" && exit 1
  postinstall
    node scripts/sync-strophe-runtime.mjs
available via `npm run-script`:
  dev:stack
    bash scripts/run-client-stack.sh
  electron
    electron electron/main.cjs
  electron:no-gateway
    ELECTRON_GATEWAY_MODE=off electron electron/main.cjs
  electron:with-gateway
    ELECTRON_GATEWAY_MODE=on electron electron/main.cjs
  build:platform
    bash scripts/build-platform.sh
  build:web
    bash scripts/build-platform.sh web --build
  build:electron
    bash scripts/build-platform.sh electron --build
  build:android
    bash scripts/build-platform.sh android --build
  mobile:build:web
    node scripts/build-mobile-web.mjs
  mobile:cap:sync
    npm run mobile:build:web && npx cap sync
  mobile:android:init
    npm run mobile:build:web && npx cap add android
  mobile:android:sync
    npm run mobile:build:web && npx cap sync android
  mobile:android:open
    npm run mobile:android:sync && npx cap open android
  sync:xmpp-runtime
    node scripts/sync-strophe-runtime.mjs
  xmpp:auth-gateway
    node scripts/xmpp-auth-gateway.mjs
15:34:06 ~/shitcord67:$ npm run electron

> discord-lookalike-flash@1.0.0 electron
> electron electron/main.cjs

[electron] linux flags: sandbox=off shm=shm
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:18080, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 2453534)
[electron] [run-client-stack] xmpp gateway port 8790 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:18080/
[run-client-stack] gateway: http://127.0.0.1:8790
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:10] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [02/Mar/2026 15:34:11] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
^C/home/duda/shitcord67/node_modules/electron/dist/electron exited with signal SIGINT
15:34:15 ~/shitcord67:$ 
15:34:16 ~/shitcord67:$ ls .
.git/                     .gitignore                .mobile-web/              .xmpp.local.example.json  .xmpp.local.json          
15:34:16 ~/shitcord67:$ ls .xmpp.local.json 
.xmpp.local.json
15:34:20 ~/shitcord67:$ cat .xmpp.local.json 
{
  "accounts": [
    {
      "label": "kazue@xmpp.jp",
      "jid": "kazue@xmpp.jp",
      "password": "kazuekazue",
      "ws": "wss://api.xmpp.jp/ws"
    },
    {
      "label": "derberg@pimux.de",
      "jid": "derberg@pimux.de",
      "password": "my>!H7V7=H<>aD>Y",
      "ws": ""
    }
  ]
}
15:34:24 ~/shitcord67:$ ./build.sh electron && ./build.sh android
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled

> Configure project :app
WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.

> Configure project :capacitor-cordova-android-plugins
WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.

BUILD SUCCESSFUL in 612ms
4 actionable tasks: 3 executed, 1 up-to-date
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 23.16ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 906.87μs
✔ copy android in 29.19ms
✔ Updating Android plugins in 708.27μs
✖ update android - failed!
[error] TypeError: Cannot read properties of undefined (reading 'extract')
        at extractTemplate (/home/duda/shitcord67/node_modules/@capacitor/cli/dist/util/template.js:9:25)
        at async removePluginsNativeFiles
        (/home/duda/shitcord67/node_modules/@capacitor/cli/dist/android/update.js:298:5)
        at async updateAndroid (/home/duda/shitcord67/node_modules/@capacitor/cli/dist/android/update.js:26:5)
        at async /home/duda/shitcord67/node_modules/@capacitor/cli/dist/tasks/update.js:69:13
        at async runTask (/home/duda/shitcord67/node_modules/@capacitor/cli/dist/common.js:165:23)
        at async update (/home/duda/shitcord67/node_modules/@capacitor/cli/dist/tasks/update.js:63:5)
        at async sync (/home/duda/shitcord67/node_modules/@capacitor/cli/dist/tasks/sync.js:56:5)
        at async syncCommand (/home/duda/shitcord67/node_modules/@capacitor/cli/dist/tasks/sync.js:33:13)
        at async /home/duda/shitcord67/node_modules/@capacitor/cli/dist/index.js:70:9
        at async /home/duda/shitcord67/node_modules/@capacitor/cli/dist/telemetry.js:26:13
## 2026-03-03T04:41:50+01:00
USER PROMPT:
> Configure project :app
WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.

> Configure project :capacitor-cordova-android-plugins
WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.

> Task :capacitor-android:compileDebugJavaWithJavac FAILED
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':capacitor-android:compileDebugJavaWithJavac'.
> error: invalid source release: 21

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.

BUILD FAILED in 4s
36 actionable tasks: 36 executed
## 2026-03-03T04:46:03+01:00
USER PROMPT:
Also is it possible to login to shitcord67 right now? Cause I don't see the dropdown in the electron app featuing my locally saves credentials and when I press Log In then nothing happens. And when I try to open devtools then it doesn't work either. 04:42:53 ~/shitcord67:$ npm run electron

> discord-lookalike-flash@1.0.0 electron
> electron electron/main.cjs

[electron] linux flags: sandbox=off shm=shm
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:18080, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 18080 is listening but http://127.0.0.1:18080/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 18080 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=18080 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:8081
[electron] starting local stack (client=127.0.0.1:8081, gateway=127.0.0.1:8790, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 3833169)
[electron] [run-client-stack] xmpp gateway port 8790 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:8081/
[run-client-stack] gateway: http://127.0.0.1:8790
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:56] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:56] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /app.js HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 04:42:57] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[3835679:0303/044355.283083:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.cuWTML failed: No such process (3)
[3835679:0303/044355.283197:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
## 2026-03-03T04:53:34+01:00
USER PROMPT:
Oh can you maybe in general use a custom port for everything?
## 2026-03-03T04:57:28+01:00
USER PROMPT:
How about using 6769 as a port?

## 2026-03-03T04:10:32Z
> Configure project :app
WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.

> Configure project :capacitor-cordova-android-plugins
WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.

> Task :capacitor-android:compileDebugJavaWithJavac
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.

> Task :app:compileDebugJavaWithJavac FAILED
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task :app:compileDebugJavaWithJavac.
> error: invalid source release: 21

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.

BUILD FAILED in 9s
50 actionable tasks: 50 executed
## 2026-03-03T04:12:20Z


## ${ts}
Please continue: › > Configure project :app
  WARNING: Using flatDir should be avoided because it doesn't support any meta-
  data formats.

  > Configure project :capacitor-cordova-android-plugins
  WARNING: Using flatDir should be avoided because it doesn't support any meta-
  data formats.

  > Task :capacitor-android:compileDebugJavaWithJavac
  Note: Some input files use unchecked or unsafe operations.
  Note: Recompile with -Xlint:unchecked for details.

  > Task :app:compileDebugJavaWithJavac FAILED
  [Incubating] Problems report is available at: file:///home/duda/shitcord67/
  android/build/reports/problems/problems-report.html

  FAILURE: Build failed with an exception.

  * What went wrong:
  Execution failed for task ':app:compileDebugJavaWithJavac'.
  > error: invalid source release: 21

  * Try:
  > Run with --stacktrace option to get the stack trace.
  > Run with --info or --debug option to get more log output.
  > Run with --scan to get full insights.
  > Get more help at https://help.gradle.org.

  BUILD FAILED in 9s

• Ran ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"; printf '
  │ ## %s
  │ %s
  │ … +27 lines
  └ (no output)

⚠ Heads up, you have less than 5% of your weekly limit left. Run /status for a breakdown.

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• I’ve logged the build output. Next I’m checking the Android Gradle config to align Java source/target compatibility with the JDK
  available on your machine.

• Explored
  └ List android
    Search build.gradle|gradle.properties|settings.gradle|versions|libs\.versions|build\.gradle\.kts
    Search sourceCompatibility|targetCompatibility|JavaVersion|kotlinOptions|jvmTarget|toolchain|VERSION_21|release in android
    Read build.gradle, capacitor.build.gradle, gradle.properties

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• I found the immediate cause: android/app/capacitor.build.gradle is generated with Java 21 while your installed JDK is 17. I’m
  now locating the generator/config source so the fix survives future capacitor update runs.

• Explored
  └ Read variables.gradle
    Search VERSION_21|javaVersion|jdk|sourceCompatibility|targetCompatibility in capacitor.config.*
    Read package.json

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• I’m applying a persistent fix in android/app/build.gradle so the app module compiles with Java 17 even after Capacitor
  regenerates capacitor.build.gradle. Then I’ll re-run the compile task to verify.

• Edited android/app/build.gradle (+9 -0)
    46
    47 +// Keep app compilation aligned with local JDK 17 even if Capacitor-generated
    48 +// settings request a newer release.
    49 +android {
    50 +    compileOptions {
    51 +        sourceCompatibility JavaVersion.VERSION_17
    52 +        targetCompatibility JavaVersion.VERSION_17
    53 +    }
    54 +}
    55 +
    56  try {

■ You've hit your usage limit. To continue using Codex and get access to GPT-5.3-Codex, start a free trial of Plus today (https://
chatgpt.com/explore/plus), or try again at Mar 10th, 2026 3:58 AM.
## ${ts}
Yes
## ${ts}
Yeah
## ${ts}
Also do we actually need Java21? Cause my archlinux-java is set to 17. I can switch it to 21 tho if we REALLY need it.
## ${ts}
05:39:58 ~/codex-cli-account-switcher:$ npm install

added 1 package, removed 68 packages, changed 20 packages, and audited 743 packages in 7s

165 packages are looking for funding
  run `npm fund` for details

27 vulnerabilities (3 low, 15 moderate, 6 high, 3 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
05:40:09 ~/codex-cli-account-switcher:$ npm run mobile:android:sync
npm error Missing script: "mobile:android:sync"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: /home/duda/.npm/_logs/2026-03-03T04_40_26_751Z-debug-0.log
05:40:26 ~/codex-cli-account-switcher:$
2026-03-03T04:52:46Z
USER PROMPT:
05:43:28 ~/shitcord67:$ rmdir buid/
05:43:30 ~/shitcord67:$ ./build.sh electron && ./build.sh android
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled
Starting a Gradle Daemon, 1 incompatible and 1 stopped Daemons could not be reused, use --status for details

FAILURE: Build failed with an exception.

* Where:
Build file '/home/duda/shitcord67/android/capacitor-cordova-android-plugins/build.gradle' line: 12

* What went wrong:
A problem occurred evaluating project ':capacitor-cordova-android-plugins'.
> Could not find method implementation() for arguments [directory 'libs'] on object of type org.gradle.api.internal.artifacts.dsl.dependencies.DefaultDependencyHandler.

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.

BUILD FAILED in 7s
2026-03-03T05:18:58Z
USER PROMPT:
Why doesn't it show the dropdown for user accounts from .xmpp.local.example.json?
2026-03-03T05:19:42Z
USER PROMPT:
Also when I click on the 🛠 symbol nothing opens up on the login screen.
2026-03-03T05:21:30Z
USER PROMPT:
And I don't see anything when I press on "Log In". 06:20:25 ~/shitcord67:$ npm run electron

> discord-lookalike-flash@1.0.0 electron
> electron electron/main.cjs

[electron] linux flags: sandbox=off shm=shm temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 178405)
[electron] [run-client-stack] started xmpp-auth-gateway (pid 178426)
[run-client-stack] client: http://127.0.0.1:6769/
[run-client-stack] gateway: http://127.0.0.1:6770
[run-client-stack] press Ctrl+C to stop.
[electron] xmpp auth gateway listening on http://127.0.0.1:6770
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET / HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /styles.css HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-loader.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/call-room-url-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/command-invocation-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/text-time-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/name-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_identity.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_devices.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_targets.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-transport-interop.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0384.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-0454.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:30] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /app.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:20:31] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 304 -
[178755:0303/062033.064167:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.9MoozB failed: No such process (3)
[178755:0303/062033.064259:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
 And when I try to open devtools it doesn't work. Why did it work in the past?
2026-03-03T05:22:00Z
USER PROMPT:
06:27:35 ~/shitcord67:$ ./build.sh electron && ./build.sh android
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled

BUILD SUCCESSFUL in 1s
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 17.57ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 1.25ms
✔ copy android in 26.75ms
✔ Updating Android plugins in 873.20μs
✔ update android in 18.55ms
[info] Sync finished in 0.055s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 12s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
06:39:09 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67 
[electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6771
[electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 221179)
[electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:6771/
[run-client-stack] gateway: http://127.0.0.1:6770
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:38] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:38] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
(electron) 'console-message' arguments are deprecated and will be removed. Please use Event<WebContentsConsoleMessageEventParams> object instead.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-runtime-bindings.js:133 Uncaught ReferenceError: XEP_0334_HINTS_GLOBAL is not defined
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError: normalizeNativeAndroidInsetsViaModule is not defined
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-ui-events-runtime.js:1009 Uncaught ReferenceError: openShortcutsDialog is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError: normalizeNativeAndroidInsetsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError: normalizeNativeAndroidInsetsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError: normalizeNativeAndroidInsetsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError: normalizeGifGroupsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError: normalizeGifGroupsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError: normalizeGifGroupsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError: normalizeGifGroupsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError: normalizeNativeAndroidInsetsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError: normalizeNativeAndroidInsetsViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError: normalizeXmppJidViaModule is not defined
[221041:0303/064105.397573:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:464 Uncaught (in promise) ReferenceError: normalizeUsernameViaModule is not defined
[222528:0303/064107.959461:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.gXPfST failed: No such process (3)
[222528:0303/064107.959592:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
 🛠 opening doesn't work, login doesn't work, opening Ctrl+Shift+I devtools doesn't work
2026-03-03T05:46:23Z
USER PROMPT:
Please continue: › 06:27:35 ~/shitcord67:$ ./build.sh electron && ./build.sh android
  [build-platform] Clean before build? [Y/n]
  [build-platform] clean step enabled
  [build-platform] packaging electron app (linux/x64)
  Packaging app for platform linux x64 using electron v35.7.5
  Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
  [build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
  [build-platform] electron output: dist/electron
  [build-platform] Clean before build? [Y/n]
  [build-platform] clean step enabled

  BUILD SUCCESSFUL in 1s
  4 actionable tasks: 4 executed
  [build-platform] syncing android project

  > discord-lookalike-flash@1.0.0 mobile:android:sync
  > npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


  > discord-lookalike-flash@1.0.0 mobile:build:web
  > node scripts/build-mobile-web.mjs

  [mobile-build] wrote .mobile-web
  ✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 17.57ms
  ✔ Creating capacitor.config.json in android/app/src/main/assets in 1.25ms
  ✔ copy android in 26.75ms
  ✔ Updating Android plugins in 873.20μs
  ✔ update android in 18.55ms
  [info] Sync finished in 0.055s

  > discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
  > node scripts/patch-capacitor-android-gradle.cjs

  [patch-capacitor-android-gradle] updated 1 file(s)
  [build-platform] building debug APK

  > Task :capacitor-android:compileDebugJavaWithJavac
  Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
  Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
  [Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

  BUILD SUCCESSFUL in 12s
  85 actionable tasks: 76 executed, 9 up-to-date
  [build-platform] android output: dist/android/app-debug.apk
  06:39:09 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
  [electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/
  shitcord67/runtime
  [electron] display media request handler installed
  [electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
  [electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/
  strophe.umd.min.js
  optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/
  @ruffle-rs/ruffle/ruffle.js
  optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/
  @dotlottie/player-component/dist/dotlottie-player.mjs
  [electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
  [run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
  [electron] stack exited code=1 signal=none
  [electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
  [electron] retrying local stack on fallback port 127.0.0.1:6771
  [electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
  [electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/
  strophe.umd.min.js
  [electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@ruffle-rs/ruffle/ruffle.js
  [electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
  [electron] [run-client-stack] started client-server (pid 221179)
  [electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
  [run-client-stack] client: http://127.0.0.1:6771/
  [run-client-stack] gateway: http://127.0.0.1:6770
  [run-client-stack] press Ctrl+C to stop.
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:38] "GET / HTTP/1.1" 200 -
  [electron] permission handlers installed for trusted local renderer origin
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:38] "GET / HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /styles.css HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
  (electron) 'console-message' arguments are deprecated and will be removed. Please use
  Event<WebContentsConsoleMessageEventParams> object instead.
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js
  HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-runtime-bindings.js:133 Uncaught ReferenceError:
  XEP_0334_HINTS_GLOBAL is not defined
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js
  HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js
  HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError:
  normalizeNativeAndroidInsetsViaModule is not defined
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /app.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:40:39] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-ui-events-runtime.js:1009 Uncaught ReferenceError:
  openShortcutsDialog is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError:
  normalizeNativeAndroidInsetsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError:
  normalizeNativeAndroidInsetsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError:
  normalizeNativeAndroidInsetsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError:
  normalizeGifGroupsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError:
  normalizeGifGroupsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError:
  normalizeGifGroupsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:310 Uncaught ReferenceError:
  normalizeGifGroupsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError:
  normalizeNativeAndroidInsetsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:244 Uncaught ReferenceError:
  normalizeNativeAndroidInsetsViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-presence-preferences-bridge.js:274 Uncaught ReferenceError:
  normalizeXmppJidViaModule is not defined
  [221041:0303/064105.397573:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
  [electron] renderer [level=3] http://127.0.0.1:6771/xeps/xep-app-core-runtime.js:464 Uncaught (in promise) ReferenceError:
  normalizeUsernameViaModule is not defined
  [222528:0303/064107.959461:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /
  tmp/.org.chromium.Chromium.gXPfST failed: No such process (3)
  [222528:0303/064107.959592:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process
  (3)
   🛠 opening doesn't work, login doesn't work, opening Ctrl+Shift+I devtools doesn't work


/status

╭────────────────────────────────────────────────────────────────────────────────╮
│  >_ OpenAI Codex (v0.104.0)                                                    │
│                                                                                │
│ Visit https://chatgpt.com/codex/settings/usage for up-to-date                  │
│ information on rate limits and credits                                         │
│                                                                                │
│  Model:                gpt-5.3-codex (reasoning none, summaries auto)          │
│  Directory:            ~/shitcord67                                            │
│  Permissions:          Default                                                 │
│  Agents.md:            AGENTS.md                                               │
│  Account:              wiwaldihalt+mail6@gmail.com (Free)                      │
│  Collaboration mode:   Default                                                 │
│  Session:              019cb20a-87a5-7350-a343-fed494ee2330                    │
│                                                                                │
│  Context window:       36% left (170K used / 258K)                             │
│  Weekly limit:         [█░░░░░░░░░░░░░░░░░░░] 4% left (resets 05:48 on 10 Mar) │
╰────────────────────────────────────────────────────────────────────────────────╯

• I can see the exact blocker now from your log: top-level runtime boot is crashing very early (xep-runtime-bindings.js), which
  cascades into all the missing function errors and makes login/🛠/DevTools hotkeys appear dead. I’m logging your message, then
  I’ll patch the bootstrap globals so those modules stop crashing at load time.

• Ran date -u +"%Y-%m-%dT%H:%M:%SZ"
  └ 2026-03-03T05:43:51Z

• Ran cat >> CONTINUITY_LOG.md <<'EOF'
  │ 2026-03-03T05:22:00Z
  │ USER PROMPT:
  │ … +252 lines
  └ (no output)

─ Worked for 2m 09s ──────────────────────────────────────────────────────────────────────────────────────────────────────────────

• I’ve logged it and confirmed the renderer crash stack you provided is enough to fix this without guesswork. I’m inspecting xep-
  runtime-bindings.js and related bootstrap variables now to eliminate the ReferenceError chain at startup.

• Explored
  └ Read xep-runtime-bindings.js
    Search normalizeNativeAndroidInsetsViaModule|normalizeGifGroupsViaModule|normalizeXmppJidViaModule|normalizeUsernameViaModule|
           XEP_0334_HINTS_GLOBAL in xeps

/status

╭────────────────────────────────────────────────────────────────────────────────╮
│  >_ OpenAI Codex (v0.104.0)                                                    │
│                                                                                │
│ Visit https://chatgpt.com/codex/settings/usage for up-to-date                  │
│ information on rate limits and credits                                         │
│                                                                                │
│  Model:                gpt-5.3-codex (reasoning none, summaries auto)          │
│  Directory:            ~/shitcord67                                            │
│  Permissions:          Default                                                 │
│  Agents.md:            AGENTS.md                                               │
│  Account:              wiwaldihalt+mail6@gmail.com (Free)                      │
│  Collaboration mode:   Default                                                 │
│  Session:              019cb20a-87a5-7350-a343-fed494ee2330                    │
│                                                                                │
│  Context window:       31% left (181K used / 258K)                             │
│  Weekly limit:         [░░░░░░░░░░░░░░░░░░░░] 0% left (resets 05:48 on 10 Mar) │
╰────────────────────────────────────────────────────────────────────────────────╯

• Ran comm -23 <(rg -o "\b[A-Z][A-Z0-9_]*_GLOBAL\b" xeps/xep-runtime-bindings.js | sort -u) <(rg -o "^const\s+([A-Z]
  │ [A-Z0-9_]*_GLOBAL)\b" xeps/xep-runtime-bindings.js -r '$1' | sort -u)
  └ CALL_ROOM_URL_UTILS_GLOBAL
    XEP_0045_0402_ROSTER_BOOKMARKS_GLOBAL
    … +13 lines
    XMPP_ENCRYPTION_PAYLOAD_GLOBAL
    XMPP_XML_GLOBAL

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• I found the concrete regression: xep-runtime-bindings.js references multiple *_GLOBAL symbols that were never declared in that
  file, so it throws immediately and breaks the rest of the UI bootstrap. I’m patching those bindings to source from
  SHITCORD67_XEP_APP_BOOTSTRAP safely.

• Edited xeps/xep-runtime-bindings.js (+19 -0)
     5
     6 +const XEP_APP_BOOTSTRAP = globalThis.SHITCORD67_XEP_APP_BOOTSTRAP || {};
     7 +const XEP_0334_HINTS_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0334_HINTS_GLOBAL || globalThis.SHITCORD67_XEP_0334_HINTS || {};
     8 +const XEP_0184_0333_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0184_0333_GLOBAL || globalThis.SHITCORD67_XEP_0184_0333_MARKERS || {};
     9 +const XEP_0249_DIRECT_MUC_INVITE_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0249_DIRECT_MUC_INVITE_GLOBAL || globalThis.SHITCORD67_XEP
        _0249_DIRECT_MUC_INVITE || {};
    10 +const XEP_0045_0402_ROSTER_BOOKMARKS_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0045_0402_ROSTER_BOOKMARKS_GLOBAL || globalThis.SHITCO
        RD67_XEP_0045_0402_ROSTER_BOOKMARKS || {};
    11 +const XEP_0359_0424_MESSAGE_REF_UTILS_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0359_0424_MESSAGE_REF_UTILS_GLOBAL || globalThis.SHIT
        CORD67_XEP_0359_0424_MESSAGE_REF_UTILS || {};
    12 +const XEP_0482_CALL_INVITE_PARSE_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0482_CALL_INVITE_PARSE_GLOBAL || globalThis.SHITCORD67_XEP
        _0482_CALL_INVITE_PARSE || {};
    13 +const XEP_0308_0424_0444_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0308_0424_0444_GLOBAL || globalThis.SHITCORD67_XEP_0308_0424_0444_
        ACTIONS || {};
    14 +const XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL || globalThis.SHITCORD
        67_XEP_0353_JINGLE_MESSAGE_PARSE || {};
    15 +const XEP_0166_0167_JINGLE_IQ_PARSE_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0166_0167_JINGLE_IQ_PARSE_GLOBAL || globalThis.SHITCORD
        67_XEP_0166_0167_JINGLE_IQ_PARSE || {};
    16 +const XEP_0320_WEBRTC_SDP_BASICS_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0320_WEBRTC_SDP_BASICS_GLOBAL || globalThis.SHITCORD67_XEP
        _0320_WEBRTC_SDP_BASICS || {};
    17 +const XEP_0203_0319_DELAY_IDLE_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0203_0319_DELAY_IDLE_GLOBAL || globalThis.SHITCORD67_XEP_020
        3_0319_DELAY_IDLE || {};
    18 +const XEP_0421_0045_MUC_OCCUPANT_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0421_0045_MUC_OCCUPANT_GLOBAL || globalThis.SHITCORD67_XEP
        _0421_0045_MUC_OCCUPANT || {};
    19 +const XEP_0153_PRESENCE_PHOTO_HASH_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0153_PRESENCE_PHOTO_HASH_GLOBAL || globalThis.SHITCORD67
        _XEP_0153_PRESENCE_PHOTO_HASH || {};
    20 +const XEP_0156_HOST_META_PARSE_GLOBAL = XEP_APP_BOOTSTRAP.XEP_0156_HOST_META_PARSE_GLOBAL || globalThis.SHITCORD67_XEP_015
        6_HOST_META_PARSE || {};
    21 +const XMPP_XML_GLOBAL = XEP_APP_BOOTSTRAP.XMPP_XML_GLOBAL || globalThis.SHITCORD67_XMPP_XML || {};
    22 +const XMPP_ENCRYPTION_PAYLOAD_GLOBAL = XEP_APP_BOOTSTRAP.XMPP_ENCRYPTION_PAYLOAD_GLOBAL || globalThis.SHITCORD67_XMPP_ENCR
        YPTION_PAYLOAD || {};
    23 +const CALL_ROOM_URL_UTILS_GLOBAL = globalThis.SHITCORD67_CALL_ROOM_URL_UTILS || {};
    24 +
    25  const XMPP_LOGIN_NORMALIZERS_GLOBAL = globalThis.SHITCORD67_XMPP_LOGIN_NORMALIZERS || {};

■ You've hit your usage limit. To continue using Codex and get access to GPT-5.3-Codex, start a free trial of Plus today (https://
chatgpt.com/explore/plus), or try again at Mar 10th, 2026 5:48 AM.
2026-03-03T05:53:04Z
USER PROMPT:
Can you also create me a build-all.sh script? And it should not ask any questions
2026-03-03T05:55:41Z
USER PROMPT:
No login possible, nothing shows up on 🛠 click and devtools don't open via Ctrl+Shift+I 06:52:26 ~/shitcord67:$ ./build.sh electron && ./build.sh android
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] Clean before build? [Y/n] 
[build-platform] clean step enabled

BUILD SUCCESSFUL in 840ms
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 15.01ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 1.33ms
✔ copy android in 21.68ms
✔ Updating Android plugins in 995.82μs
✔ update android in 18.59ms
[info] Sync finished in 0.049s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 5s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
06:54:08 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67 
[electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6771
[electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6771 is listening but http://127.0.0.1:6771/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6771 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6771 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6772
[electron] starting local stack (client=127.0.0.1:6772, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 253905)
[electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:6772/
[run-client-stack] gateway: http://127.0.0.1:6770
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
(electron) 'console-message' arguments are deprecated and will be removed. Please use Event<WebContentsConsoleMessageEventParams> object instead.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-runtime-bindings.js:860 Uncaught ReferenceError: xepModule is not defined
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:12] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-app-xmpp-state-runtime.js:1 Uncaught SyntaxError: Identifier 'XEP_0166_0167_JINGLE_IQ_PARSE_GLOBAL' has already been declared
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-app-state-bootstrap-runtime.js:125 Uncaught ReferenceError: MESSAGE_CHAR_LIMIT_DEFAULT is not defined
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /app.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6772/app.js:7 Uncaught ReferenceError: ui is not defined
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:13] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-app-ui-events-runtime.js:6 Uncaught ReferenceError: XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL is not defined
[253660:0303/065425.788486:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /? HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /styles.css HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-transport-interop.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0454.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /app.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 304 -
127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-loader.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/call-room-url-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/command-invocation-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/text-time-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/name-normalizers.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_identity.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:35] "GET /xeps/xep-0384_devices.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:36] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:36] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 304 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 06:54:36] "GET /xeps/xep-0384_targets.js HTTP/1.1" 304 -
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-runtime-bindings.js:860 Uncaught ReferenceError: xepModule is not defined
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-app-xmpp-state-runtime.js:1 Uncaught SyntaxError: Identifier 'XEP_0166_0167_JINGLE_IQ_PARSE_GLOBAL' has already been declared
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-app-state-bootstrap-runtime.js:125 Uncaught ReferenceError: MESSAGE_CHAR_LIMIT_DEFAULT is not defined
[electron] renderer [level=3] http://127.0.0.1:6772/app.js:7 Uncaught ReferenceError: ui is not defined
[electron] renderer [level=3] http://127.0.0.1:6772/xeps/xep-app-ui-events-runtime.js:6 Uncaught ReferenceError: XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL is not defined
[255216:0303/065443.944444:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.88Al1j failed: No such process (3)
[255216:0303/065443.944535:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
2026-03-03T06:15:35Z
USER PROMPT:
I noticed that xmpp:danctnix-trash2@chat.disroot.org is missing in my list despite I'm being in this XMPP chat. You can use command line tools to login into my account and check this. Please just don't send any messages, READ ONLY. Oh also looks like in shitcord67 I don't see any chat history and can't send messages currently. Please investigate if other stuff is broken and fix it. Oh also can't still open devtools. Also I think buttons to copy logs are broken right now. {
  "runtime": {
    "location": "http://127.0.0.1:6773/",
    "ruffleReady": true,
    "dotLottieReady": true,
    "activeGuildId": "xmpp-spaces:pimux.de",
    "activeChannelId": "72e9ed27-ba1b-464d-a17b-fff7e99b706c"
  },
  "logs": [
    {
      "ts": "2026-03-03T06:08:39.929Z",
      "level": "info",
      "message": "Loaded CDN Ruffle runtime",
      "data": {
        "src": "https://unpkg.com/@ruffle-rs/ruffle"
      }
    },
    {
      "ts": "2026-03-03T06:08:39.954Z",
      "level": "info",
      "message": "Loaded CDN dotLottie runtime",
      "data": {
        "src": "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
      }
    }
  ]
} Copied my XMPP log to the file xmpp-log in this dir. Oh also here the output from running shitcor67: :55:47 ~/shitcord67:$ ./build-all.sh 
[build-platform] clean step enabled
[build-platform] building web bundle

> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
[build-platform] web output: dist/web
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] clean step enabled

BUILD SUCCESSFUL in 768ms
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 18.82ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 977.75μs
✔ copy android in 25.19ms
✔ Updating Android plugins in 738.10μs
✔ update android in 16.95ms
[info] Sync finished in 0.05s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 4s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
07:05:10 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
[electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6771
[electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6771 is listening but http://127.0.0.1:6771/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6771 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6771 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6772
[electron] starting local stack (client=127.0.0.1:6772, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6772 is listening but http://127.0.0.1:6772/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6772 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6772 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6773
[electron] starting local stack (client=127.0.0.1:6773, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 282095)
[electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:6773/
[run-client-stack] gateway: http://127.0.0.1:6770
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:38] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:38] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:38] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:38] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
(electron) 'console-message' arguments are deprecated and will be removed. Please use Event<WebContentsConsoleMessageEventParams> object instead.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] code 404, message File not found
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /swf/index.json HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "HEAD /vendor/ruffle/ruffle.js HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /swf/swf-index.json HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] "GET /swf-index.json HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:39] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 07:08:39] "HEAD /vendor/dotlottie/dotlottie-player.mjs HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:08:42] "GET /vendor/strophe.umd.min.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:4320 Render failed (login-submit) ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:273:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:273:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:273:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[288909:0303/071058.444371:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.3m6YNn failed: No such process (3)
[288909:0303/071058.444464:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[281879:0303/071123.842389:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[281879:0303/071123.842389:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[281879:0303/071123.842389:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[281879:0303/071123.842389:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[281879:0303/071123.842389:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:142 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:684 Uncaught ReferenceError: getComposerSuggestionState is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/app.js:2255 Uncaught ReferenceError: clearReplyComposer is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174 Uncaught ReferenceError: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 ReferenceError: renderSlashSuggestions is not defined
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6773/xeps/xep-app-render-messages-runtime.js:174:3)
    at http://127.0.0.1:6773/xeps/xep-0313_mam-loading.js:418:36
    at k.handler (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:20387)
    at k.run (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
    at http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:24020
    at Object.v [as forEachChild] (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:7178)
    at Connection._dataRecv (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:23956)
    at G.Websocket._onMessage (http://127.0.0.1:6773/vendor/strophe.umd.min.js:1:52862)
[electron] renderer [level=3] http://127.0.0.1:6773/vendor/strophe.umd.min.js:1 error: renderSlashSuggestions is not defined
[281879:0303/071123.842389:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
2026-03-03T06:35:29Z
USER PROMPT:
1. yes .xmpp.local.json, also in fact the second entry. Then 2. I don't care which, 3. yes ofc
2026-03-03T08:05:18+01:00
Last conversation: • Here’s what I did and what I found.

  Read‑only XMPP check (CLI)
  I used your .xmpp.local.json second account (derberg@pimux.de) and connected read‑only over WebSocket (no presence, no
  messages). Results:

  - legacy_bookmarks: 0
  - pubsub_bookmarks: 0
  - roster_entries: 5
  - target_in_any: False for danctnix-trash2@chat.disroot.org

  So the room is not present in bookmarks for this account, which explains why the app doesn’t list it (it builds the server list
  from bookmarks). If you expect it to appear, we need to make sure the bookmark is actually stored on the XMPP server
  (XEP‑0048/0402) or handle “active but unbookmarked” rooms in the app UI.

  Fixes already landed (should unblock UI)
  The renderer errors you saw (renderSlashSuggestions, getComposerSuggestionState, clearReplyComposer) were killing message render
  + input, so I fixed those and improved DevTools temp dir fallback. You’ll need to rebuild to see effect.

  Next step: rebuild and re‑test

  ./build.sh electron
  /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67

  Please confirm after rebuild:

  1. Can you open DevTools via Ctrl+Shift+I?
  2. Do messages/history render and sending work?
  3. Do “Copy Logs” buttons work?

  ———

  If the room still doesn’t appear after the rebuild, I’ll add a “live rooms” fallback that surfaces recently active MUCs even if
  bookmarks are missing (read‑only) and/or adds a “manual join” that persists a bookmark.


› 07:51:37 ~/shitcord67:$ ./build-all.sh
  [build-platform] clean step enabled
  [build-platform] building web bundle

  > discord-lookalike-flash@1.0.0 mobile:build:web
  > node scripts/build-mobile-web.mjs

  [mobile-build] wrote .mobile-web
  [build-platform] web output: dist/web
  [build-platform] clean step enabled
  [build-platform] packaging electron app (linux/x64)
  Packaging app for platform linux x64 using electron v35.7.5
  Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
  [build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
  [build-platform] electron output: dist/electron
  [build-platform] clean step enabled

  BUILD SUCCESSFUL in 706ms
  4 actionable tasks: 4 executed
  [build-platform] syncing android project

  > discord-lookalike-flash@1.0.0 mobile:android:sync
  > npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


  > discord-lookalike-flash@1.0.0 mobile:build:web
  > node scripts/build-mobile-web.mjs

  [mobile-build] wrote .mobile-web
  ✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 14.76ms
  ✔ Creating capacitor.config.json in android/app/src/main/assets in 818.49μs
  ✔ copy android in 20.39ms
  ✔ Updating Android plugins in 824.49μs
  ✔ update android in 17.58ms
  [info] Sync finished in 0.046s

  > discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
  > node scripts/patch-capacitor-android-gradle.cjs

  [patch-capacitor-android-gradle] updated 1 file(s)
  [build-platform] building debug APK

  > Task :capacitor-android:compileDebugJavaWithJavac
  Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
  Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
  [Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

  BUILD SUCCESSFUL in 3s
  85 actionable tasks: 76 executed, 9 up-to-date
  [build-platform] android output: dist/android/app-debug.apk
  07:53:00 ~/shitcord67:$ ./build-all.sh
  07:59:42 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
  [electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/
  shitcord67/runtime
  [electron] display media request handler installed
  [electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
  [electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/
  strophe.umd.min.js
  optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/
  @ruffle-rs/ruffle/ruffle.js
  optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/
  @dotlottie/player-component/dist/dotlottie-player.mjs
  [electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
  [run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
  [electron] stack exited code=1 signal=none
  [electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
  [electron] retrying local stack on fallback port 127.0.0.1:6771
  [electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
  [electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/
  strophe.umd.min.js
  [electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@ruffle-rs/ruffle/ruffle.js
  [electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
  [electron] stack stderr: [run-client-stack] client server port 6771 is listening but http://127.0.0.1:6771/ is not responding.
  [run-client-stack] refusing stale reuse; stop the process on port 6771 or pick another CLIENT_PORT.
  [electron] stack exited code=1 signal=none
  [electron] startup attempt failed port=6771 error=Local stack exited early (code=1, signal=none).
  [electron] retrying local stack on fallback port 127.0.0.1:6772
  [electron] starting local stack (client=127.0.0.1:6772, gateway=127.0.0.1:6770, mode=auto)
  [electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/
  strophe.umd.min.js
  [electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@ruffle-rs/ruffle/ruffle.js
  [electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
  [electron] stack stderr: [run-client-stack] client server port 6772 is listening but http://127.0.0.1:6772/ is not responding.
  [run-client-stack] refusing stale reuse; stop the process on port 6772 or pick another CLIENT_PORT.
  [electron] stack exited code=1 signal=none
  [electron] startup attempt failed port=6772 error=Local stack exited early (code=1, signal=none).
  [electron] retrying local stack on fallback port 127.0.0.1:6773
  [electron] starting local stack (client=127.0.0.1:6773, gateway=127.0.0.1:6770, mode=auto)
  [electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/
  strophe.umd.min.js
  [electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@ruffle-rs/ruffle/ruffle.js
  [electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/
  node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
  [electron] [run-client-stack] started client-server (pid 391341)
  [electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
  [run-client-stack] client: http://127.0.0.1:6773/
  [run-client-stack] gateway: http://127.0.0.1:6770
  [run-client-stack] press Ctrl+C to stop.
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:46] "GET / HTTP/1.1" 200 -
  [electron] permission handlers installed for trusted local renderer origin
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:46] "GET / HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:46] "GET /styles.css HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:46] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
  (electron) 'console-message' arguments are deprecated and will be removed. Please use
  Event<WebContentsConsoleMessageEventParams> object instead.
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js
  HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js
  HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js
  HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1"
  200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /app.js HTTP/1.1" 200 -
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 07:59:47] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
  [electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:1 Uncaught SyntaxError: Identifier
  'XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL' has already been declared
  [391146:0303/080009.527364:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
  [electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:00:10] "GET /? HTTP/1.1" 200 -
  [electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:1 Uncaught SyntaxError: Identifier
  'XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL' has already been declared
  [392590:0303/080016.602309:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /
  tmp/.org.chromium.Chromium.TVETxA failed: No such process (3)
  [392590:0303/080016.602471:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process
  (3)
   And now I can't login again, nothing happens when I press 🛠 and devtools don't open via Ctrl+Shift+I
2026-03-03T08:16:44+01:00
08:09:20 ~/shitcord67:$ ./build-all.sh 
[build-platform] clean step enabled
[build-platform] building web bundle

> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
[build-platform] web output: dist/web
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] clean step enabled

BUILD SUCCESSFUL in 938ms
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 17.05ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 814.54μs
✔ copy android in 23.11ms
✔ Updating Android plugins in 723.94μs
✔ update android in 23.01ms
[info] Sync finished in 0.054s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 3s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
08:10:36 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
[electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6771
[electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6771 is listening but http://127.0.0.1:6771/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6771 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6771 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6772
[electron] starting local stack (client=127.0.0.1:6772, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6772 is listening but http://127.0.0.1:6772/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6772 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6772 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6773
[electron] starting local stack (client=127.0.0.1:6773, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 419933)
[electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:6773/
[run-client-stack] gateway: http://127.0.0.1:6770
[electron] [run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:35] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
(electron) 'console-message' arguments are deprecated and will be removed. Please use Event<WebContentsConsoleMessageEventParams> object instead.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:36] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:1 Uncaught SyntaxError: Identifier 'XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL' has already been declared
[419734:0303/081347.429093:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:13:54] "GET /? HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6773/xeps/xep-app-ui-events-runtime.js:1 Uncaught SyntaxError: Identifier 'XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL' has already been declared
[420910:0303/081359.127272:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.i9OC0Q failed: No such process (3)
[420910:0303/081359.127361:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
 Login, devtools and 🛠 broken still, I don't even get the dropdown selection of users from .xmpp.local.json
2026-03-03T08:30:57+01:00
Dropdown works and login works, 🛠 works, devtools still don't work. When I'm logged in I can't seem to see any chat content in the chat area (while in the DM sidebar) I can see that I get messages and can partially see their content). Also I still don't see xmpp:danctnix-trash2@chat.disroot.org listed in my xmpp spaces despite my second stored account being in that; you can confirm that by running cli tools to login to xmpp. You can run the rg command on your own! Some output: 08:20:24 ~/shitcord67:$ ./build-all.sh
[build-platform] clean step enabled
[build-platform] building web bundle

> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
[build-platform] web output: dist/web
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] clean step enabled

BUILD SUCCESSFUL in 743ms
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 16.43ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 918.27μs
✔ copy android in 23.06ms
✔ Updating Android plugins in 1.22ms
✔ update android in 16.37ms
[info] Sync finished in 0.048s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 3s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
08:21:45 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
[electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6771
[electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6771 is listening but http://127.0.0.1:6771/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6771 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6771 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6772
[electron] starting local stack (client=127.0.0.1:6772, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6772 is listening but http://127.0.0.1:6772/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6772 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6772 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6773
[electron] starting local stack (client=127.0.0.1:6773, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6773 is listening but http://127.0.0.1:6773/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6773 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6773 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6970
[electron] starting local stack (client=127.0.0.1:6970, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 440961)
[electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:6970/
[electron] [run-client-stack] gateway: http://127.0.0.1:6770
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
(electron) 'console-message' arguments are deprecated and will be removed. Please use Event<WebContentsConsoleMessageEventParams> object instead.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:45] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /swf/index.json HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 08:22:46] "HEAD /vendor/ruffle/ruffle.js HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /swf/swf-index.json HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] "GET /swf-index.json HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:46] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 08:22:46] "HEAD /vendor/dotlottie/dotlottie-player.mjs HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 08:22:56] "GET /vendor/strophe.umd.min.js HTTP/1.1" 200 -
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 ReferenceError: canEditMessageEntry is not defined
    at http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:1015:28
    at Array.forEach (<anonymous>)
    at renderMessages (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:600:17)
    at maybeLoadOlderXmppHistoryForActiveConversation (http://127.0.0.1:6970/xeps/xep-relay-connection-flow.js:2155:18)
    at Object.renderMessages [as renderMessagesFn] (http://127.0.0.1:6970/xeps/xep-app-render-messages-runtime.js:566:9)
    at http://127.0.0.1:6970/xeps/xep-0313_mam-loading.js:297:36
    at k.handler (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:20491)
    at k.run (http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:11361)
    at http://127.0.0.1:6970/vendor/strophe.umd.min.js:1:24096
    at Array.reduce (<anonymous>)
[electron] renderer [level=3] http://127.0.0.1:6970/vendor/strophe.umd.min.js:1 error: canEditMessageEntry is not defined
 {
  "runtime": {
    "location": "http://127.0.0.1:6970/",
    "ruffleReady": true,
    "dotLottieReady": true,
    "activeGuildId": "xmpp-spaces:pimux.de",
    "activeChannelId": "c161dc99-3456-4d19-b9f2-ba4161a90fa0"
  },
  "logs": [
    {
      "ts": "2026-03-03T07:22:46.472Z",
      "level": "info",
      "message": "Loaded CDN Ruffle runtime",
      "data": {
        "src": "https://unpkg.com/@ruffle-rs/ruffle"
      }
    },
    {
      "ts": "2026-03-03T07:22:46.496Z",
      "level": "info",
      "message": "Loaded CDN dotLottie runtime",
      "data": {
        "src": "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
      }
    }
  ]
)
2026-03-03T08:45:29+01:00
08:41:11 ~/shitcord67:$ ./build-all.sh
[build-platform] clean step enabled
[build-platform] building web bundle

> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
[build-platform] web output: dist/web
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] clean step enabled

BUILD SUCCESSFUL in 751ms
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 15.95ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 1.17ms
✔ copy android in 24.06ms
✔ Updating Android plugins in 711.57μs
✔ update android in 16.95ms
[info] Sync finished in 0.05s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 3s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
08:42:33 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
... (full log provided in prompt) ...
Devtools still not working, danctnix room still missing. Also I think you may be able to use the cli by using a socket or something, maybe calling tmux? Cause then it may have internet

## 2026-03-03T08:16:00Z
Oh also why is the loading of SWF soooo slow?

## 2026-03-03T08:16:05Z
Performance is really bad

## 2026-03-03T08:16:10Z
Like even the file picker is slow when I open it due to that I think

## 2026-03-03T09:35:00Z
Well now I don't even see which messages I wrote in other clients?! And loading SWF is still immensely slow. Also do they even get send to other people? Same for other media? Cause I don't see that appear in other accounts. And devtools can still not be opened. Also /shrug does still not show ¯\_(ツ)_/¯ after sending it. danctnix community is now visible at least. 09:17:02 ~/shitcord67:$ ./build-all.sh
[build-platform] clean step enabled
[build-platform] building web bundle

> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
[build-platform] web output: dist/web
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] clean step enabled

BUILD SUCCESSFUL in 743ms
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 19.56ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 1.20ms
✔ copy android in 27.59ms
✔ Updating Android plugins in 1.26ms
✔ update android in 15.54ms
[info] Sync finished in 0.053s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 3s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
09:28:34 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
[electron] packaged linux flags: sandbox=off shm=shm runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6771
[electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6771 is listening but http://127.0.0.1:6771/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6771 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6771 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6772
[electron] starting local stack (client=127.0.0.1:6772, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6772 is listening but http://127.0.0.1:6772/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6772 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6772 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6773
[electron] starting local stack (client=127.0.0.1:6773, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6773 is listening but http://127.0.0.1:6773/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6773 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6773 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6970
[electron] starting local stack (client=127.0.0.1:6970, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6970 is listening but http://127.0.0.1:6970/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6970 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6970 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:46593
[electron] starting local stack (client=127.0.0.1:46593, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 595354)
[electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:46593/
[run-client-stack] gateway: http://127.0.0.1:6770
[electron] [run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
(electron) 'console-message' arguments are deprecated and will be removed. Please use Event<WebContentsConsoleMessageEventParams> object instead.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:03] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:04] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:04] code 404, message File not found
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:04] "GET /swf/index.json HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:04] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 09:29:04] "HEAD /vendor/ruffle/ruffle.js HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:04] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 09:29:04] "GET /swf/swf-index.json HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:04] "GET /swf-index.json HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:04] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 09:29:04] "HEAD /vendor/dotlottie/dotlottie-player.mjs HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:29:07] "GET /vendor/strophe.umd.min.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:30:20] "GET /swf/precious_thing.swf HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:30:20] "GET /swf/renaming.swf HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:30:20] "GET /swf/nanaca-crash_v110.swf HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 09:30:20] "GET /swf/protectorNDM0.swf HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 09:30:20] "GET /swf/Protector%20IVv.swf HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:30:20] "GET /swf/protector_3_1_12_Secure.swf HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:30:20] "GET /swf/protector_3_map-editor.swf HTTP/1.1" 200 -
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://x.mochiads.com/srv/1/14db77fb5595fde6.swf": BlockedHost("*.mochiads.com") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://www.mochiads.com/static/lib/services/services.swf": BlockedHost("*.mochiads.com") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer unresponsive
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://x.mochiads.com/srv/1/37160f3507c6546c.swf": BlockedHost("*.mochiads.com") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://mochibot.com/my/core.swf?mv=8&fv=10&v=LNX%2032%2C0%2C0%2C0&swfid=8583bee5&l=10301&f=_level0&sb=remote&t=1": FetchError("Got JS error") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://mochibot.com/my/core.swf?mv=7&fv=8&v=LNX%2032%2C0%2C0%2C0&swfid=439256e5&l=10301&f=_level0&sb=remote&t=1": FetchError("Got JS error") color: red; background: #444 color: gray; font-style: italic color: inherit
[600639:0303/093134.278885:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.wXcTpv failed: No such process (3)
[600639:0303/093134.278973:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[600639:0303/093134.278994:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
[600981:0303/093142.018873:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /dev/shm/.org.chromium.Chromium.lsQZ4b failed: No such process (3)
[600981:0303/093142.018960:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /dev/shm: No such process (3)
[600981:0303/093142.018983:FATAL:platform_shared_memory_region_posix.cc(226)] This is frequently caused by incorrect permissions on /dev/shm.  Try 'sudo chmod 1777 /dev/shm' to fix.
[2026-03-03T09:55:00Z] USER PROMPT:
Oh can you maybe make a markdown exception for shrug? so that I see ¯\_(ツ)_/¯ in chat. Also I'm still not seing the messages sent from the same account but in a different client. The SWF stuff is still unresponsive as fuck. Devtools still doesn't open at all. 09:45:12 ~/shitcord67:$ ./build-all.sh
[build-platform] clean step enabled
[build-platform] building web bundle

> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
[build-platform] web output: dist/web
[build-platform] clean step enabled
[build-platform] packaging electron app (linux/x64)
Packaging app for platform linux x64 using electron v35.7.5
Wrote new app to: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64
[build-platform] linux desktop entry: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67.desktop
[build-platform] electron output: dist/electron
[build-platform] clean step enabled

BUILD SUCCESSFUL in 847ms
4 actionable tasks: 4 executed
[build-platform] syncing android project

> discord-lookalike-flash@1.0.0 mobile:android:sync
> npm run mobile:build:web && npx cap sync android && npm run mobile:android:patch-gradle


> discord-lookalike-flash@1.0.0 mobile:build:web
> node scripts/build-mobile-web.mjs

[mobile-build] wrote .mobile-web
✔ Copying web assets from .mobile-web to android/app/src/main/assets/public in 15.29ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 775.18μs
✔ copy android in 22.74ms
✔ Updating Android plugins in 879.77μs
✔ update android in 15.40ms
[info] Sync finished in 0.044s

> discord-lookalike-flash@1.0.0 mobile:android:patch-gradle
> node scripts/patch-capacitor-android-gradle.cjs

[patch-capacitor-android-gradle] updated 1 file(s)
[build-platform] building debug APK

> Task :capacitor-android:compileDebugJavaWithJavac
Hinweis: Einige Eingabedateien verwenden nicht geprüfte oder unsichere Vorgänge.
Hinweis: Wiederholen Sie die Kompilierung mit -Xlint:unchecked, um Details zu erhalten.
[Incubating] Problems report is available at: file:///home/duda/shitcord67/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 3s
85 actionable tasks: 76 executed, 9 up-to-date
[build-platform] android output: dist/android/app-debug.apk
09:46:27 ~/shitcord67:$ /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/shitcord67
[electron] packaged linux flags: sandbox=off shm=tmp runtimeTmp=/home/duda/.cache/shitcord67/runtime temp=/home/duda/.cache/shitcord67/runtime
[electron] display media request handler installed
[electron] starting local stack (client=127.0.0.1:6769, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6769 is listening but http://127.0.0.1:6769/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6769 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6769 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6771
[electron] starting local stack (client=127.0.0.1:6771, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6771 is listening but http://127.0.0.1:6771/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6771 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6771 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6772
[electron] starting local stack (client=127.0.0.1:6772, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6772 is listening but http://127.0.0.1:6772/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6772 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6772 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6773
[electron] starting local stack (client=127.0.0.1:6773, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6773 is listening but http://127.0.0.1:6773/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6773 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6773 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:6970
[electron] starting local stack (client=127.0.0.1:6970, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] stack stderr: [run-client-stack] client server port 6970 is listening but http://127.0.0.1:6970/ is not responding.
[run-client-stack] refusing stale reuse; stop the process on port 6970 or pick another CLIENT_PORT.
[electron] stack exited code=1 signal=none
[electron] startup attempt failed port=6970 error=Local stack exited early (code=1, signal=none).
[electron] retrying local stack on fallback port 127.0.0.1:32799
[electron] starting local stack (client=127.0.0.1:32799, gateway=127.0.0.1:6770, mode=auto)
[electron] synced strophe runtime -> /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/vendor/strophe.umd.min.js
[electron] optional ruffle runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@ruffle-rs/ruffle/ruffle.js
[electron] optional dotlottie runtime source missing: /home/duda/shitcord67/dist/electron/shitcord67-linux-x64/resources/app/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs
[electron] [run-client-stack] started client-server (pid 636731)
[electron] [run-client-stack] xmpp gateway port 6770 already in use, reusing existing gateway.
[run-client-stack] client: http://127.0.0.1:32799/
[run-client-stack] gateway: http://127.0.0.1:6770
[run-client-stack] press Ctrl+C to stop.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET / HTTP/1.1" 200 -
[electron] permission handlers installed for trusted local renderer origin
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET / HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /styles.css HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /assets/libsignal_protocol.min.js HTTP/1.1" 200 -
(electron) 'console-message' arguments are deprecated and will be removed. Please use Event<WebContentsConsoleMessageEventParams> object instead.
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /xeps/xep-loader.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /xeps/call-room-url-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /xeps/xmpp-login-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /xeps/media-provider-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /xeps/ui-state-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /xeps/account-profile-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:49] "GET /xeps/xmpp-call-target-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/command-invocation-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xmpp-message-id-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/text-time-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/name-normalizers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_crypto-namespaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_namespace-selection.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_omemo-crypto-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_preferences.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_identity.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_sessions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_devices.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_bundles.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_own-bundle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_targets.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_message-crypto.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_decrypt-content.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_decrypt-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0334_processing-hints.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0085-chatstates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0184_0333-message-markers.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0184_0333-marker-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0249_direct-muc-invite.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0045_0402-roster-bookmarks.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0359_0424-message-ref-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0482_call-invite-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0308_0424_0444-message-actions.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0353_jingle-message-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0115_caps-presence.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0203_0319-delay-idle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0421_0045-muc-occupant.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0421_0045-muc-actor-cache.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0166_0167-jingle-iq-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0166_0167-jingle-send.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0320_webrtc-sdp-basics.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0066_0071_0231-oob-media.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0461_0428-message-replies.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0313_mam-loading.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0333_0359_0372_0444_0482-message-builders.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0030_0166-call-disco.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0308_0359_0424_0444-message-updates.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0199_0410_0313-presence-ping.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0048_0402-bookmarks-ops.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0048_0402-bookmarks-sync.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0045_0503-room-lifecycle.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0184_0333_0359-delivery-indexes.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0280_0352-csi-carbons.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0482_0503-spaces-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0503_spaces.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0153_presence-photo-hash.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0156_host-meta-parse.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0156_xmpp-login-discovery-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_omemo-store.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xmpp-xml-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xmpp_encryption-payload.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384_omemo-stanza.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0454_omemo-media-sharing-utils.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-runtime-bindings.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-transport-interop.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0030_0166-jingle-call-core.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-relay-connection-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-presence-preferences-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-xmpp-dm-bridge.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0334-processing-hints-storage.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-upload-disco-attachments.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-xmpp-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-slash-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-dm-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-call-invite-web-console-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-xmpp-ui-bindings-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-xmpp-roster-bookmarks-login-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-native-call-ui-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-jingle-call-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0166_0320-webrtc-session-flow.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0384.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0454.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-bootstrap.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-xmpp-bridges.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-message-command-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-render-messages-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-member-list-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-shell-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-servers-dms-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-xmpp-state-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0066_0071_0231-rich-text-media-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0066_0071_0231-attachment-render-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0066_0071_0231-swf-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-0066_0071_0231-media-picker-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-state-bootstrap-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-core-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /app.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /xeps/xep-app-ui-events-runtime.js HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] code 404, message File not found
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /swf/index.json HTTP/1.1" 404 -
127.0.0.1 - - [03/Mar/2026 09:47:50] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 09:47:50] "HEAD /vendor/ruffle/ruffle.js HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /swf/swf-index.json HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] "GET /swf-index.json HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:50] code 404, message File not found
127.0.0.1 - - [03/Mar/2026 09:47:50] "HEAD /vendor/dotlottie/dotlottie-player.mjs HTTP/1.1" 404 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:47:53] "GET /vendor/strophe.umd.min.js HTTP/1.1" 200 -
[636470:0303/094925.184615:ERROR:atom_cache.cc(231)] Add chromium/x-internal-source-rfh-token to kAtomsToCache
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:53:02] "GET /swf/nanaca-crash_v110.swf HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 09:53:02] "GET /swf/precious_thing.swf HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 09:53:02] "GET /swf/protectorNDM0.swf HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 09:53:02] "GET /swf/Protector%20IVv.swf HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 09:53:02] "GET /swf/renaming.swf HTTP/1.1" 200 -
127.0.0.1 - - [03/Mar/2026 09:53:02] "GET /swf/protector_3_1_12_Secure.swf HTTP/1.1" 200 -
[electron] stack stderr: 127.0.0.1 - - [03/Mar/2026 09:53:02] "GET /swf/protector_3_map-editor.swf HTTP/1.1" 200 -
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://x.mochiads.com/srv/1/14db77fb5595fde6.swf": BlockedHost("*.mochiads.com") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://www.mochiads.com/static/lib/services/services.swf": BlockedHost("*.mochiads.com") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://x.mochiads.com/srv/1/37160f3507c6546c.swf": BlockedHost("*.mochiads.com") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://mochibot.com/my/core.swf?mv=7&fv=8&v=LNX%2032%2C0%2C0%2C0&swfid=439256e5&l=10301&f=_level0&sb=remote&t=1": FetchError("Got JS error") color: red; background: #444 color: gray; font-style: italic color: inherit
[electron] renderer [level=1] https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1 %cERROR%c core/src/loader.rs:796%c Error during movie loading of "http://mochibot.com/my/core.swf?mv=8&fv=10&v=LNX%2032%2C0%2C0%2C0&swfid=8583bee5&l=10301&f=_level0&sb=remote&t=1": FetchError("Got JS error") color: red; background: #444 color: gray; font-style: italic color: inherit
[650279:0303/095332.415656:ERROR:platform_shared_memory_region_posix.cc(221)] Creating shared memory in /tmp/.org.chromium.Chromium.E1njZe failed: No such process (3)
[650279:0303/095332.415734:ERROR:platform_shared_memory_region_posix.cc(224)] Unable to access(W_OK|X_OK) /tmp: No such process (3)
 At least sending image attachments seems to work but SWFs and GIFs from the file picker are still not sent to other people. {
  "relayMode": "xmpp",
  "relayStatus": "connected",
  "xmppConnected": true,
  "xmppRuntimeReady": true,
  "xmppRuntimeLastError": "",
  "filter": "all",
  "search": "kazue@xmpp.jp",
  "paused": true,
  "eventsTotal": 92,
  "eventsShown": 67,
  "activeCallSessions": []
}

[2026-03-03T09:02:04.426Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:04.426Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:08.559Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:08.559Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:11.371Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:11.371Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:13.231Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:13.231Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:13.239Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:13.239Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:13.268Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" id="s67-10e501b9-6c6" xmlns="jabber:client"><body>/xmppinspect here</body><origin-id xmlns="urn:xmpp:sid:0" id="s67-origin-f8610d45-df4"/><store xmlns="urn:xmpp:hints"/><markable xmlns="urn:xmpp:chat-markers:0"/><request xmlns="urn:xmpp:receipts"/></message>

[2026-03-03T09:02:13.268Z] [raw] TX
<message id="s67-10e501b9-6c6" to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><body>/xmppinspect here</body><origin-id id="s67-origin-f8610d45-df4" xmlns="urn:xmpp:sid:0"/><store xmlns="urn:xmpp:hints"/><markable xmlns="urn:xmpp:chat-markers:0"/><request xmlns="urn:xmpp:receipts"/></message>

[2026-03-03T09:02:14.091Z] [raw] RX
<message from='kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm' id='35d3f899-4452-4169-95f2-7322b4ec45f1' type='chat' to='derberg@pimux.de' xmlns='jabber:client' xml:lang='en'><received xmlns='urn:xmpp:receipts' id='s67-origin-f8610d45-df4'/><no-store xmlns='urn:xmpp:hints'/><no-copy xmlns='urn:xmpp:hints'/><delay from='derberg@pimux.de' xmlns='urn:xmpp:delay' stamp='2026-03-03T09:02:14Z'/></message>

[2026-03-03T09:02:14.092Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm" id="35d3f899-4452-4169-95f2-7322b4ec45f1" type="chat" to="derberg@pimux.de" xml:lang="en"><received xmlns="urn:xmpp:receipts" id="s67-origin-f8610d45-df4"/><no-store xmlns="urn:xmpp:hints"/><no-copy xmlns="urn:xmpp:hints"/><delay xmlns="urn:xmpp:delay" from="derberg@pimux.de" stamp="2026-03-03T09:02:14Z"/></message>

[2026-03-03T09:02:14.097Z] [message] Received XMPP delivery receipt
{
  "from": "kazue@xmpp.jp",
  "id": "s67-origin-f8610d45-df4",
  "matched": true
}

[2026-03-03T09:02:14.355Z] [raw] RX
<message from='kazue@xmpp.jp/dino.13eb7ed4' id='940fdcae-ab05-4799-b16b-48587dd684d8' to='derberg@pimux.de/TTOTUVyRZauN' xmlns='jabber:client' xml:lang='en'><received id='s67-origin-f8610d45-df4' xmlns='urn:xmpp:receipts'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2ef-0344-7291-8e92-a468ae64c0ba'/></message>

[2026-03-03T09:02:14.355Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/dino.13eb7ed4" id="940fdcae-ab05-4799-b16b-48587dd684d8" to="derberg@pimux.de/TTOTUVyRZauN" xml:lang="en"><received xmlns="urn:xmpp:receipts" id="s67-origin-f8610d45-df4"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2ef-0344-7291-8e92-a468ae64c0ba"/></message>

[2026-03-03T09:02:14.356Z] [raw] RX
<message from='kazue@xmpp.jp/dino.13eb7ed4' id='1d6e0614-9c16-4773-9010-b4f5010d07d1' type='chat' to='derberg@pimux.de/TTOTUVyRZauN' xmlns='jabber:client' xml:lang='en'><received id='s67-origin-f8610d45-df4' xmlns='urn:xmpp:chat-markers:0'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2ef-0345-7234-885d-3448d1d9dfef'/></message>

[2026-03-03T09:02:14.356Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/dino.13eb7ed4" id="1d6e0614-9c16-4773-9010-b4f5010d07d1" type="chat" to="derberg@pimux.de/TTOTUVyRZauN" xml:lang="en"><received xmlns="urn:xmpp:chat-markers:0" id="s67-origin-f8610d45-df4"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2ef-0345-7234-885d-3448d1d9dfef"/></message>

[2026-03-03T09:02:14.356Z] [message] Received XMPP chat marker
{
  "from": "kazue@xmpp.jp",
  "marker": "received",
  "id": "s67-origin-f8610d45-df4",
  "matched": false
}

[2026-03-03T09:02:14.615Z] [raw] RX
<message from='kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm' id='be25e585-42fe-4f64-b10b-1316698cb021' type='chat' to='derberg@pimux.de' xmlns='jabber:client' xml:lang='en'><displayed id='s67-10e501b9-6c6' xmlns='urn:xmpp:chat-markers:0'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2ef-0449-76f7-9420-4710b755169e'/></message>

[2026-03-03T09:02:14.616Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm" id="be25e585-42fe-4f64-b10b-1316698cb021" type="chat" to="derberg@pimux.de" xml:lang="en"><displayed xmlns="urn:xmpp:chat-markers:0" id="s67-10e501b9-6c6"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2ef-0449-76f7-9420-4710b755169e"/></message>

[2026-03-03T09:02:14.621Z] [message] Received XMPP chat marker
{
  "from": "kazue@xmpp.jp",
  "marker": "displayed",
  "id": "s67-10e501b9-6c6",
  "matched": true
}

[2026-03-03T09:02:18.967Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:18.967Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:42.539Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:42.539Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:49.304Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:49.304Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:49.400Z] [raw] RX
<message from='derberg@pimux.de' xmlns='jabber:client' to='derberg@pimux.de/TTOTUVyRZauN' type='chat'><sent xmlns='urn:xmpp:carbons:2'><forwarded xmlns='urn:xmpp:forward:0'><message from='derberg@pimux.de/gajim.WCL9KBQU' id='40676145-81e3-4626-b5c1-179a670900c3' type='chat' to='kazue@xmpp.jp' xmlns='jabber:client' xml:lang='de-DE'><origin-id id='40676145-81e3-4626-b5c1-179a670900c3' xmlns='urn:xmpp:sid:0'/><composing xmlns='http://jabber.org/protocol/chatstates'/><no-store xmlns='urn:xmpp:hints'/></message></forwarded></sent><delay from='derberg@pimux.de' xmlns='urn:xmpp:delay' stamp='2026-03-03T09:02:46Z'/></message>

[2026-03-03T09:02:49.400Z] [message] Incoming stanza
<message xmlns="jabber:client" from="derberg@pimux.de" to="derberg@pimux.de/TTOTUVyRZauN" type="chat"><sent xmlns="urn:xmpp:carbons:2"><forwarded xmlns="urn:xmpp:forward:0"><message xmlns="jabber:client" from="derberg@pimux.de/gajim.WCL9KBQU" id="40676145-81e3-4626-b5c1-179a670900c3" type="chat" to="kazue@xmpp.jp" xml:lang="de-DE"><origin-id xmlns="urn:xmpp:sid:0" id="40676145-81e3-4626-b5c1-179a670900c3"/><composing xmlns="http://jabber.org/protocol/chatstates"/><no-store xmlns="urn:xmpp:hints"/></message></forwarded></sent><delay xmlns="urn:xmpp:delay" from="derberg@pimux.de" stamp="2026-03-03T09:02:46Z"/></message>

[2026-03-03T09:02:49.406Z] [raw] RX
<message from='derberg@pimux.de' xmlns='jabber:client' to='derberg@pimux.de/TTOTUVyRZauN' type='chat'><sent xmlns='urn:xmpp:carbons:2'><forwarded xmlns='urn:xmpp:forward:0'><message from='derberg@pimux.de/gajim.WCL9KBQU' id='a962ed9e-75a7-4153-82ae-d1c563bf54e3' type='chat' to='kazue@xmpp.jp' xmlns='jabber:client' xml:lang='de-DE'><body>wallah</body><origin-id xmlns='urn:xmpp:sid:0' id='a962ed9e-75a7-4153-82ae-d1c563bf54e3'/><request xmlns='urn:xmpp:receipts'/><active xmlns='http://jabber.org/protocol/chatstates'/><markable xmlns='urn:xmpp:chat-markers:0'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2ef-8531-78f6-a5cf-5cc39bca6c4d'/></message></forwarded></sent></message>

[2026-03-03T09:02:49.406Z] [message] Incoming stanza
<message xmlns="jabber:client" from="derberg@pimux.de" to="derberg@pimux.de/TTOTUVyRZauN" type="chat"><sent xmlns="urn:xmpp:carbons:2"><forwarded xmlns="urn:xmpp:forward:0"><message xmlns="jabber:client" from="derberg@pimux.de/gajim.WCL9KBQU" id="a962ed9e-75a7-4153-82ae-d1c563bf54e3" type="chat" to="kazue@xmpp.jp" xml:lang="de-DE"><body>wallah</body><origin-id xmlns="urn:xmpp:sid:0" id="a962ed9e-75a7-4153-82ae-d1c563bf54e3"/><request xmlns="urn:xmpp:receipts"/><active xmlns="http://jabber.org/protocol/chatstates"/><markable xmlns="urn:xmpp:chat-markers:0"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2ef-8531-78f6-a5cf-5cc39bca6c4d"/></message></forwarded></sent></message>

[2026-03-03T09:02:49.407Z] [raw] RX
<message from='kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm' id='09085f77-ba01-4a44-b729-96c0ae632dca' type='chat' to='derberg@pimux.de' xmlns='jabber:client' xml:lang='en'><received xmlns='urn:xmpp:receipts' id='a962ed9e-75a7-4153-82ae-d1c563bf54e3'/><no-store xmlns='urn:xmpp:hints'/><no-copy xmlns='urn:xmpp:hints'/><delay from='derberg@pimux.de' xmlns='urn:xmpp:delay' stamp='2026-03-03T09:02:48Z'/></message>

[2026-03-03T09:02:49.407Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm" id="09085f77-ba01-4a44-b729-96c0ae632dca" type="chat" to="derberg@pimux.de" xml:lang="en"><received xmlns="urn:xmpp:receipts" id="a962ed9e-75a7-4153-82ae-d1c563bf54e3"/><no-store xmlns="urn:xmpp:hints"/><no-copy xmlns="urn:xmpp:hints"/><delay xmlns="urn:xmpp:delay" from="derberg@pimux.de" stamp="2026-03-03T09:02:48Z"/></message>

[2026-03-03T09:02:49.408Z] [message] Received XMPP delivery receipt
{
  "from": "kazue@xmpp.jp",
  "id": "a962ed9e-75a7-4153-82ae-d1c563bf54e3",
  "matched": false
}

[2026-03-03T09:02:49.408Z] [raw] RX
<message from='kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm' id='8f70f124-5203-4848-9a58-69f531cb2d33' type='chat' to='derberg@pimux.de' xmlns='jabber:client' xml:lang='en'><displayed id='a962ed9e-75a7-4153-82ae-d1c563bf54e3' xmlns='urn:xmpp:chat-markers:0'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2ef-887f-74ae-9a11-fcb10f8a0fb7'/></message>

[2026-03-03T09:02:49.408Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm" id="8f70f124-5203-4848-9a58-69f531cb2d33" type="chat" to="derberg@pimux.de" xml:lang="en"><displayed xmlns="urn:xmpp:chat-markers:0" id="a962ed9e-75a7-4153-82ae-d1c563bf54e3"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2ef-887f-74ae-9a11-fcb10f8a0fb7"/></message>

[2026-03-03T09:02:49.408Z] [message] Received XMPP chat marker
{
  "from": "kazue@xmpp.jp",
  "marker": "displayed",
  "id": "a962ed9e-75a7-4153-82ae-d1c563bf54e3",
  "matched": false
}

[2026-03-03T09:02:50.505Z] [raw] RX
<message from='derberg@pimux.de' xmlns='jabber:client' to='derberg@pimux.de/TTOTUVyRZauN' type='chat'><received xmlns='urn:xmpp:carbons:2'><forwarded xmlns='urn:xmpp:forward:0'><message from='kazue@xmpp.jp/dino.13eb7ed4' id='13d932c1-7a13-47a1-bf3d-6a81f654185c' type='chat' to='derberg@pimux.de/gajim.WCL9KBQU' xmlns='jabber:client' xml:lang='en'><received xmlns='urn:xmpp:chat-markers:0' id='a962ed9e-75a7-4153-82ae-d1c563bf54e3'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2ef-8df2-73dc-b02c-dd343216ec95'/></message></forwarded></received></message>

[2026-03-03T09:02:50.506Z] [message] Incoming stanza
<message xmlns="jabber:client" from="derberg@pimux.de" to="derberg@pimux.de/TTOTUVyRZauN" type="chat"><received xmlns="urn:xmpp:carbons:2"><forwarded xmlns="urn:xmpp:forward:0"><message xmlns="jabber:client" from="kazue@xmpp.jp/dino.13eb7ed4" id="13d932c1-7a13-47a1-bf3d-6a81f654185c" type="chat" to="derberg@pimux.de/gajim.WCL9KBQU" xml:lang="en"><received xmlns="urn:xmpp:chat-markers:0" id="a962ed9e-75a7-4153-82ae-d1c563bf54e3"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2ef-8df2-73dc-b02c-dd343216ec95"/></message></forwarded></received></message>

[2026-03-03T09:02:50.506Z] [message] Received XMPP chat marker
{
  "from": "kazue@xmpp.jp",
  "marker": "received",
  "id": "a962ed9e-75a7-4153-82ae-d1c563bf54e3",
  "matched": false
}

[2026-03-03T09:02:52.396Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:02:52.396Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:36.532Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:36.532Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:36.585Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:36.585Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:36.593Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:36.593Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:40.189Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:40.189Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:40.201Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:40.201Z] [raw] TX
<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><paused xmlns="http://jabber.org/protocol/chatstates"/></message>

[2026-03-03T09:03:40.239Z] [stanza] send()
<message to="kazue@xmpp.jp" type="chat" id="s67-4af59648-44a" xmlns="jabber:client"><body>/xmppinspect here</body><origin-id xmlns="urn:xmpp:sid:0" id="s67-origin-e25aab5b-da6"/><store xmlns="urn:xmpp:hints"/><markable xmlns="urn:xmpp:chat-markers:0"/><request xmlns="urn:xmpp:receipts"/></message>

[2026-03-03T09:03:40.239Z] [raw] TX
<message id="s67-4af59648-44a" to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><body>/xmppinspect here</body><origin-id id="s67-origin-e25aab5b-da6" xmlns="urn:xmpp:sid:0"/><store xmlns="urn:xmpp:hints"/><markable xmlns="urn:xmpp:chat-markers:0"/><request xmlns="urn:xmpp:receipts"/></message>

[2026-03-03T09:03:41.063Z] [raw] RX
<message from='kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm' id='fa12f2c1-fd2c-4c82-82a8-b88e23e50ef4' type='chat' to='derberg@pimux.de' xmlns='jabber:client' xml:lang='en'><received xmlns='urn:xmpp:receipts' id='s67-origin-e25aab5b-da6'/><no-store xmlns='urn:xmpp:hints'/><no-copy xmlns='urn:xmpp:hints'/><delay from='derberg@pimux.de' xmlns='urn:xmpp:delay' stamp='2026-03-03T09:03:41Z'/></message>

[2026-03-03T09:03:41.064Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm" id="fa12f2c1-fd2c-4c82-82a8-b88e23e50ef4" type="chat" to="derberg@pimux.de" xml:lang="en"><received xmlns="urn:xmpp:receipts" id="s67-origin-e25aab5b-da6"/><no-store xmlns="urn:xmpp:hints"/><no-copy xmlns="urn:xmpp:hints"/><delay xmlns="urn:xmpp:delay" from="derberg@pimux.de" stamp="2026-03-03T09:03:41Z"/></message>

[2026-03-03T09:03:41.071Z] [message] Received XMPP delivery receipt
{
  "from": "kazue@xmpp.jp",
  "id": "s67-origin-e25aab5b-da6",
  "matched": true
}

[2026-03-03T09:03:41.357Z] [raw] RX
<message from='kazue@xmpp.jp/dino.13eb7ed4' id='f126a6df-819b-460e-9d17-6e9226fd107c' to='derberg@pimux.de/TTOTUVyRZauN' xmlns='jabber:client' xml:lang='en'><received id='s67-origin-e25aab5b-da6' xmlns='urn:xmpp:receipts'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2f0-56ff-77fb-803b-c0a9ffab13e2'/></message>

[2026-03-03T09:03:41.357Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/dino.13eb7ed4" id="f126a6df-819b-460e-9d17-6e9226fd107c" to="derberg@pimux.de/TTOTUVyRZauN" xml:lang="en"><received xmlns="urn:xmpp:receipts" id="s67-origin-e25aab5b-da6"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2f0-56ff-77fb-803b-c0a9ffab13e2"/></message>

[2026-03-03T09:03:41.450Z] [raw] RX
<message from='kazue@xmpp.jp/dino.13eb7ed4' id='dea51909-6a45-4a7c-b725-ecff8dc59e3d' type='chat' to='derberg@pimux.de/TTOTUVyRZauN' xmlns='jabber:client' xml:lang='en'><received id='s67-origin-e25aab5b-da6' xmlns='urn:xmpp:chat-markers:0'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2f0-5701-728d-a94b-0874f12ef493'/></message>

[2026-03-03T09:03:41.451Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/dino.13eb7ed4" id="dea51909-6a45-4a7c-b725-ecff8dc59e3d" type="chat" to="derberg@pimux.de/TTOTUVyRZauN" xml:lang="en"><received xmlns="urn:xmpp:chat-markers:0" id="s67-origin-e25aab5b-da6"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2f0-5701-728d-a94b-0874f12ef493"/></message>

[2026-03-03T09:03:41.451Z] [message] Received XMPP chat marker
{
  "from": "kazue@xmpp.jp",
  "marker": "received",
  "id": "s67-origin-e25aab5b-da6",
  "matched": false
}

[2026-03-03T09:03:41.612Z] [raw] RX
<message from='kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm' id='fc2b2d4c-7643-4d6d-9d4a-6ddd55f37779' type='chat' to='derberg@pimux.de' xmlns='jabber:client' xml:lang='en'><displayed id='s67-4af59648-44a' xmlns='urn:xmpp:chat-markers:0'/><stanza-id xmlns='urn:xmpp:sid:0' by='derberg@pimux.de' id='019cb2f0-5804-7ca2-ad92-f76eafc5373d'/></message>

[2026-03-03T09:03:41.613Z] [message] Incoming stanza
<message xmlns="jabber:client" from="kazue@xmpp.jp/Movim.SsA8O1.KIy8f5-OEm" id="fc2b2d4c-7643-4d6d-9d4a-6ddd55f37779" type="chat" to="derberg@pimux.de" xml:lang="en"><displayed xmlns="urn:xmpp:chat-markers:0" id="s67-4af59648-44a"/><stanza-id xmlns="urn:xmpp:sid:0" by="derberg@pimux.de" id="019cb2f0-5804-7ca2-ad92-f76eafc5373d"/></message>

[2026-03-03T09:03:41.621Z] [message] Received XMPP chat marker
{
  "from": "kazue@xmpp.jp",
  "marker": "displayed",
  "id": "s67-4af59648-44a",
  "matched": true
}

[2026-03-03T09:18:39Z] Can you continue working on what you did before? There is continuity log you can read. Also this is a snippet from your last output: • I found an additional SWF bottleneck: the runtime still allowed external URL loading inside SWFs (openUrlMode: "allow" in load  paths), which matches your MochiAds spam/errors and UI hangs. I’m patching that to deny, plus fixing DM self-carbon routing and  media-picker send publishing now.  • Edited xeps/xep-presence-preferences-bridge.js (+26 -1)     1419    if (room.startsWith("dm:")) {     1420 -    const thread = getOrCreateDmThread(current, remoteAccount);     1420 +    let dmPeerAccount = remoteAccount;     1421 +    if (dmPeerAccount?.id === current.id) {     1422 +      const existingThread = findDmThreadByRelayRoom(room, current);     1423 +      const existingPeerId = existingThread?.participantIds?.find((id) => id && id !== current.id) || "";     1424 +      const existingPeer = existingPeerId ? getAccountById(existingPeerId) : null;     1425 +      if (existingPeer?.id && existingPeer.id !== current.id) {     1426 +        dmPeerAccount = existingPeer;     1427 +      } else {     1428 +        const roomParts = room     1429 +          .slice(3)     1430 +          .split(":")     1431 +          .map((value) => normalizeUsername(value || ""))     1432 +          .filter(Boolean);     1433 +        const currentName = normalizeUsername(current.username || "");     1434 +        const peerName = roomParts.find((value) => value && value !== currentName) || "";     1435 +        if (peerName) {     1436 +          let peerAccount = getAccountByUsername(peerName);     1437 +          if (!peerAccount) {     1438 +            peerAccount = createAccount(peerName, peerName);     1439 +            state.accounts.push(peerAccount);     1440 +          }     1441 +          dmPeerAccount = peerAccount;     1442 +        }     1443 +      }     1444 +    }     1445 +    const thread = getOrCreateDmThread(current, dmPeerAccount);     1446      if (!thread) return null;  ■ You've hit your usage limit. To continue using Codex and get access to GPT-5.3-Codex, start a free trial of Plus today (https:// chatgpt.com/explore/plus), or try again at Mar 10th, 2026 8:49 AM.

[2026-03-03T10:50:58Z] Okay yeah SWFs are not slowing the app down significantly anymore and other issues I mentioned are fixed except the devtools issue. {\n  "relayMode": "xmpp",\n  "relayStatus": "connected",\n  "xmppConnected": true,\n  "xmppRuntimeReady": true,\n  "xmppRuntimeLastError": "",\n  "filter": "all",\n  "search": "kazue@xmpp.jp",\n  "paused": true,\n  "eventsTotal": 600,\n  "eventsShown": 126,\n  "activeCallSessions": []\n}\n\n[2026-03-03T10:46:14.684Z] [stanza] send()\n<message to="kazue@xmpp.jp" type="chat" xmlns="jabber:client"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>\n... (logs truncated) ...\n Oh also /shrug still has no markdown formatting exception so it shows like  ¯\(ツ)/¯ instead of ¯\_(ツ)_/¯

[2026-03-03T10:56:11Z] Can we also get sed-like substitutions, similar to Discord has them so we can quickly edit the last message?

[2026-03-03T10:57:38Z] Then is there a way we can test if XEPs are working correctly and if they are missing things?

[2026-03-03T11:15:10Z] Maybe actually try that by default..

[2026-03-03T11:16:12Z] How to get the service thing?
2026-03-03T11:26:37Z Can you please continue working on something?

2026-03-03T00:00:00Z Oh. When I start shitcord67 again then I see Ruffle not being able to load SWF files send in chat. # Error Info
Error name: Error
Error message: Failed to fetch http://127.0.0.1:36481/swf/renaming.swf
Error stack:
```
Error: Failed to fetch http://127.0.0.1:36481/swf/renaming.swf
    at un.displayRootMovieDownloadFailedMessage (https://unpkg.com/@ruffle-rs/ruffle:1:433968)
    at __wbg_displayRootMovieDownloadFailedMessage_886113d10fb6f986 (https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1:28712)
    at ruffle_web.wasm.ruffle_web::JavascriptPlayer::display_root_movie_download_failed_message::__wbg_displayRootMovieDownloadFailedMessage_886113d10fb6f986::hff68a2dd5e2c54bf externref shim (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[12583]:0x93744e)
    at ruffle_web.wasm.<ruffle_web::ui::WebUiBackend as ruffle_core::backend::ui::UiBackend>::display_root_movie_download_failed_message::hdc20f0a3d67640fb (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[8735]:0x8cd86a)
    at ruffle_web.wasm.ruffle_core::loader::load_root_movie::{{closure}}::h0cb2593c63eb8873 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[1293]:0x315486)
    at ruffle_web.wasm.<ruffle_web::navigator::WebNavigatorBackend as ruffle_core::backend::navigator::NavigatorBackend>::spawn_future::{{closure}}::h765a217c6682c0a4 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[1271]:0x2f0992)
    at ruffle_web.wasm.wasm_bindgen_futures::queue::QueueState::run_all::he611081c89e90c4d (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[4533]:0x74a0ee)
    at ruffle_web.wasm.wasm_bindgen_futures::queue::Queue::new::{{closure}}::h4b157e95d8b77ad5 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[11584]:0x92623e)
    at ruffle_web.wasm.wasm_bindgen::convert::closures::_::invoke::h8dee5e9efdde44a9 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[11414]:0x92348d)
    at ruffle_web.wasm.wasm_bindgen::convert::closures::_::invoke::h8dee5e9efdde44a9 externref shim (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[12310]:0x92e9ef)
```

# Player Info
Allows script access: false
Renderer: wgpu
Adapter Backend: Gl
Adapter Name: "ANGLE (AMD, AMD Radeon RX 560 Series (radeonsi polaris11 ACO), OpenGL 4.6)"
Adapter Device Type: Other
Adapter Driver Name: ""
Adapter Driver Info: "WebGL 2.0 (OpenGL ES 3.0 Chromium)"
Enabled features: Features { features_wgpu: FeaturesWGPU(TEXTURE_ADAPTER_SPECIFIC_FORMAT_FEATURES), features_webgpu: FeaturesWebGPU(TEXTURE_COMPRESSION_BC | FLOAT32_FILTERABLE) }
Available features: Features { features_wgpu: FeaturesWGPU(PUSH_CONSTANTS | CLEAR_TEXTURE | MULTIVIEW), features_webgpu: FeaturesWebGPU(DEPTH32FLOAT_STENCIL8 | TEXTURE_COMPRESSION_BC_SLICED_3D) }
Current limits: Limits { max_texture_dimension_1d: 16384, max_texture_dimension_2d: 16384, max_texture_dimension_3d: 2048, max_texture_array_layers: 256, max_bind_groups: 4, max_bindings_per_bind_group: 1000, max_dynamic_uniform_buffers_per_pipeline_layout: 8, max_dynamic_storage_buffers_per_pipeline_layout: 0, max_sampled_textures_per_shader_stage: 16, max_samplers_per_shader_stage: 16, max_storage_buffers_per_shader_stage: 0, max_storage_textures_per_shader_stage: 0, max_uniform_buffers_per_shader_stage: 11, max_uniform_buffer_binding_size: 65536, max_storage_buffer_binding_size: 0, max_vertex_buffers: 8, max_vertex_attributes: 16, max_vertex_buffer_array_stride: 255, min_uniform_buffer_offset_alignment: 32, min_storage_buffer_offset_alignment: 256, max_inter_stage_shader_components: 128, max_color_attachments: 4, max_color_attachment_bytes_per_sample: 32, max_compute_workgroup_storage_size: 0, max_compute_invocations_per_workgroup: 0, max_compute_workgroup_size_x: 0, max_compute_workgroup_size_y: 0, max_compute_workgroup_size_z: 0, max_compute_workgroups_per_dimension: 0, min_subgroup_size: 0, max_subgroup_size: 0, max_push_constant_size: 0, max_non_sampler_bindings: 1000000, max_task_workgroup_total_count: 0, max_task_workgroups_per_dimension: 0, max_mesh_output_layers: 0, max_mesh_multiview_count: 0, max_blas_primitive_count: 0, max_blas_geometry_count: 0, max_tlas_instance_count: 0, max_acceleration_structures_per_shader_stage: 0 }
Surface quality: high
Surface samples: 4
Surface size: (550, 400, 1)

# Page Info
Page URL: http://127.0.0.1:44837/
SWF URL: http://127.0.0.1:36481/swf/renaming.swf

# Browser Info
User Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) discord-lookalike-flash/1.0.0 Chrome/134.0.6998.205 Electron/35.7.5 Safari/537.36
Platform: Linux x86_64
Has touch support: false

# Ruffle Info
Version: 0.2.0-nightly.2026.3.3
Name: 0.2.0-nightly.2026.3.3
Channel: nightly
Built: 2026-03-03T00:12:57.283Z
Commit: 3f0a915501efe29fe28f7d7d3d958b6ec7d91388
Is extension: false

# Metadata
 Also on Android: the lower part of the GUI is drawn below my navigation bar and the upper part of the GUI is drawn behind my status bar and my notch. This is VERY BAD UX. Can't you investigate on what to do to shift the content a bit and instead show just gray padding at the top and bottom at the height of the navigation bar and the status bar at least but ideally notch? Also could we store and load the credentials somewhere, ideally with option to survive app reinstallation. E.g. in Documents folder in android.
2026-03-03T12:05:38Z Oh. When I start shitcord67 again then I see Ruffle not being able to load SWF files send in chat. Also Android safe area and credential persistence request. (Relogged after initial append failed.)
2026-03-03T00:00:00Z Do separate commits.
2026-03-03T12:34:39Z Do separate commits.
2026-03-03T00:00:00Z Commit them all and run all

## 2026-03-03T15:40:30+01:00 User Prompt
Also on Android: the lower part of the GUI is drawn below my navigation bar and the upper part of the GUI is drawn behind my
  status bar and my notch. This is VERY BAD UX. Can't you investigate on what to do to shift the content a bit and instead show
  just gray padding at the top and bottom at the height of the navigation bar and the status bar at least but ideally notch? Also are the credentials stored there somewhere, ideally with option to survive app reinstallation. E.g. in Documents folder
  in android? THen on desktop: # Error Info
Error name: Error
Error message: Failed to fetch https://localhost/swf/renaming.swf
Error stack:
```
Error: Failed to fetch https://localhost/swf/renaming.swf
    at un.displayRootMovieDownloadFailedMessage (https://unpkg.com/@ruffle-rs/ruffle:1:433968)
    at __wbg_displayRootMovieDownloadFailedMessage_886113d10fb6f986 (https://unpkg.com/@ruffle-rs/ruffle/core.ruffle.3a151f1d9c5f65729f8d.js:1:28712)
    at ruffle_web.wasm.ruffle_web::JavascriptPlayer::display_root_movie_download_failed_message::__wbg_displayRootMovieDownloadFailedMessage_886113d10fb6f986::hff68a2dd5e2c54bf externref shim (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[12583]:0x93744e)
    at ruffle_web.wasm.<ruffle_web::ui::WebUiBackend as ruffle_core::backend::ui::UiBackend>::display_root_movie_download_failed_message::hdc20f0a3d67640fb (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[8735]:0x8cd86a)
    at ruffle_web.wasm.ruffle_core::loader::load_root_movie::{{closure}}::h0cb2593c63eb8873 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[1293]:0x315486)
    at ruffle_web.wasm.<ruffle_web::navigator::WebNavigatorBackend as ruffle_core::backend::navigator::NavigatorBackend>::spawn_future::{{closure}}::h765a217c6682c0a4 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[1271]:0x2f0992)
    at ruffle_web.wasm.wasm_bindgen_futures::queue::QueueState::run_all::he611081c89e90c4d (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[4533]:0x74a0ee)
    at ruffle_web.wasm.wasm_bindgen_futures::queue::Queue::new::{{closure}}::h4b157e95d8b77ad5 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[11584]:0x92623e)
    at ruffle_web.wasm.wasm_bindgen::convert::closures::_::invoke::h8dee5e9efdde44a9 (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[11414]:0x92348d)
    at ruffle_web.wasm.wasm_bindgen::convert::closures::_::invoke::h8dee5e9efdde44a9 externref shim (wasm://wasm/ruffle_web.wasm-03167d72:wasm-function[12310]:0x92e9ef)
```

# Player Info
Allows script access: false
Renderer: wgpu
Adapter Backend: Gl
Adapter Name: "ANGLE (AMD, AMD Radeon RX 560 Series (radeonsi polaris11 ACO), OpenGL 4.6)"
Adapter Device Type: Other
Adapter Driver Name: ""
Adapter Driver Info: "WebGL 2.0 (OpenGL ES 3.0 Chromium)"
Enabled features: Features { features_wgpu: FeaturesWGPU(TEXTURE_ADAPTER_SPECIFIC_FORMAT_FEATURES), features_webgpu: FeaturesWebGPU(TEXTURE_COMPRESSION_BC | FLOAT32_FILTERABLE) }
Available features: Features { features_wgpu: FeaturesWGPU(PUSH_CONSTANTS | CLEAR_TEXTURE | MULTIVIEW), features_webgpu: FeaturesWebGPU(DEPTH32FLOAT_STENCIL8 | TEXTURE_COMPRESSION_BC_SLICED_3D) }
Current limits: Limits { max_texture_dimension_1d: 16384, max_texture_dimension_2d: 16384, max_texture_dimension_3d: 2048, max_texture_array_layers: 256, max_bind_groups: 4, max_bindings_per_bind_group: 1000, max_dynamic_uniform_buffers_per_pipeline_layout: 8, max_dynamic_storage_buffers_per_pipeline_layout: 0, max_sampled_textures_per_shader_stage: 16, max_samplers_per_shader_stage: 16, max_storage_buffers_per_shader_stage: 0, max_storage_textures_per_shader_stage: 0, max_uniform_buffers_per_shader_stage: 11, max_binding_array_elements_per_shader_stage: 0, max_binding_array_sampler_elements_per_shader_stage: 0, max_uniform_buffer_binding_size: 65536, max_storage_buffer_binding_size: 0, max_vertex_buffers: 8, max_buffer_size: 268435456, max_vertex_attributes: 16, max_vertex_buffer_array_stride: 255, min_uniform_buffer_offset_alignment: 32, min_storage_buffer_offset_alignment: 256, max_inter_stage_shader_components: 128, max_color_attachments: 4, max_color_attachment_bytes_per_sample: 32, max_compute_workgroup_storage_size: 0, max_compute_invocations_per_workgroup: 0, max_compute_workgroup_size_x: 0, max_compute_workgroup_size_y: 0, max_compute_workgroup_size_z: 0, max_compute_workgroups_per_dimension: 0, min_subgroup_size: 0, max_subgroup_size: 0, max_push_constant_size: 0, max_non_sampler_bindings: 1000000, max_task_workgroup_total_count: 0, max_task_workgroups_per_dimension: 0, max_mesh_output_layers: 0, max_mesh_multiview_count: 0, max_blas_primitive_count: 0, max_blas_geometry_count: 0, max_tlas_instance_count: 0, max_acceleration_structures_per_shader_stage: 0 }
Surface quality: high
Surface samples: 4
Surface size: (550, 400, 1)

# Page Info
Page URL: http://127.0.0.1:35767/
SWF URL: https://localhost/swf/renaming.swf

# Browser Info
User Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) discord-lookalike-flash/1.0.0 Chrome/134.0.6998.205 Electron/35.7.5 Safari/537.36
Platform: Linux x86_64
Has touch support: false

# Ruffle Info
Version: 0.2.0-nightly.2026.3.3
Name: 0.2.0-nightly.2026.3.3
Channel: nightly
Built: 2026-03-03T00:12:57.283Z
Commit: 3f0a915501efe29fe28f7d7d3d958b6ec7d91388
Is extension: false

# Metadata why does this happen? On Android it works. Oh also when I send some SWF on desktop then I might not see it on Android. Duh. Also in general, can you improve how the Ruffle thing is displayed? E.g. when I scroll then I can see that there is some delay with the Ruffle instances moving with the scrolling on Android. This is bad UX, they should scroll without any noticeable delay. Also on desktop when I have two messages with Ruffle instances after another and for the first one the controls open, then the second one does not seem to move correctly with its mssage down/up live. Then in general why do the controls open immiadetly when I'm over the message? Please only open them when I hover over the content. Not only for Ruffle but for videos as well. Also speaking of videos: on Android the video player does not seem to work, can we maybe ship a custom one or is there some package we can use? Then is there still some XMPP-specific stuff in app.js that could potentially be split out into own files?

## 2026-03-03T15:58:00+01:00 User Prompt
Yeah then feel free to split out more. Oh also please really make it possible to open Chrome/electorn devtools.

## 2026-03-03T16:01:00+01:00 User Prompt
Yes

## 2026-03-03T16:03:00+01:00 User Prompt
Would be good if you could move our 500 lines + regarding XMPP stuff

## 2026-03-03T16:05:00+01:00 User Prompt
Yeah

## 2026-03-03T00:00:00Z User Prompt
Yeah

## 2026-03-03T00:00:00Z User Prompt
geändert:       android/app/capacitor.build.gradle
	geändert:       android/capacitor.settings.gradle
Don't those need commits?

## 2026-03-03T15:56:14Z
Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

## 2026-03-03T15:59:30Z
Move a lot more XEP code out of app.js into xeps subfolder while ideally completing the implementation of a xep or at least making it more complete. Please continue as long as you can, I expect 500 lines to leave app.js at the minimum before you stop

## 2026-03-03T16:01:20Z
Is there still XMPP-specific code in app.js? If se then move that out of that. Later I want to support other protocols as well and we only need to run protocols when we need them.

## 2026-03-03T16:16:49Z
Is there more XMPP-specific stuff in app.js? If so move that out, ideally extend or complete XEP-related implementation if possible.

## 2026-03-03T16:20:54Z
Then I noticed that user avatars are broken again. They worked a few commits ago. Also the controls for SWF ans video do show up when I'm just hovering over the message where the players are contained but I asked that they should only start becoming visible after I hover over the players itself (and when I leave the message then they should be not visible anymore ofc)

## 2026-03-03T16:24:20Z
Oh also I noticed that the SWF PiP is not movable and resizeable anymore?

## 2026-03-03T16:24:58Z
Please investigate if moving out some of the stuff out of app.js might have broken some other thing in the GUI

## 2026-03-03T16:32:19Z
Also yeah feel free to do the pass

## 2026-03-03T16:35:02Z
Well. How about you try implementing IRC support now?
[2026-03-03T16:37:08Z] USER PROMPT: Yes

## 2026-03-03T16:37:08Z
Yes

## 2026-03-03T16:45:15Z
Yeah. Also why on Android are my creadentials not properly stored in the Documents folder and preserved even after I uninstall the app? Does the app need folder permissions? If so, then please ask for it?

## 2026-03-03T16:49:22Z
Yeah

## 2026-03-03T16:52:20Z
Any idea on how to make the Android UX better? Especially maybe actually using padding for users with notch?

## 2026-03-03T16:54:15Z
Yeah

## 2026-03-03T17:01:37Z
/status

## 2026-03-03T17:46:22Z
Yeah ignore status. Can you work on the other stuff?

## 2026-03-03T17:47:51Z
Oh btw. I don't think the chat should automatically scroll down. I hope it does not do this now. But yeah work on the next thing then

## 2026-03-03T17:52:13Z
Yeah maybe?

## 2026-03-03T18:00:05Z
Yes

## 2026-03-03T18:23:13Z
Feel free to continue with some stuff

## 2026-03-03T18:24:56Z
How about you improve some XEPs?

## 2026-03-03T18:25:20Z
Or implement some more? We also have some clients cloned after all, there might be low hanging fruits.

## 2026-03-03T18:26:55Z
Yeah

## 2026-03-03T18:28:37Z
Yes

## 2026-03-03T18:29:06Z
Actually feel free to work on stuff you want to work on without ever asking.

## 2026-03-03T18:33:49Z
Yes

## 2026-03-03T18:34:42Z
Yes

## 2026-03-03T18:39:25Z
Yeah

## 2026-03-03T18:44:55Z
Continue

## 2026-03-03T18:48:14Z
Work on more stuff

## 2026-03-03T19:10:40Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on

## 2026-03-03T19:13:42Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on

## 2026-03-03T19:19:18Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on

## 2026-03-03T19:21:24Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on

## 2026-03-03T19:23:33Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on. Please prefer fancy new stuff useful for Discord-like functionality and high priority

## 2026-03-03T19:34:37Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on. Please prefer fancy new stuff useful for Discord-like functionality and high priority

## 2026-03-03T19:39:11Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on. Please prefer fancy new stuff useful for Discord-like functionality and high priority

## 2026-03-03T19:42:26Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on. Please prefer fancy new stuff useful for Discord-like functionality and high priority

## 2026-03-03T19:44:40Z
You can work on stuff you want for as long as you want. Please just never ask me and never stop working on different stuff. If you are done with something, switch to the next thing you like to work on. Please prefer fancy new stuff useful for Discord-like functionality and high priority
[2026-03-03T20:51:07+01:00] Please continue
[2026-03-03T20:51:56+01:00] Apropos call, is the screen sharing feature now working? Please really make it work if now.
[2026-03-03T20:59:48+01:00] I will look at this later. Can you continue working on high priority item? Also important is that I get an actual selector for screen sharing in which I can see my windows and monitors and if running in web then browser tabs as well. Also ideally for webcam there should be also a picker with preview.
[2026-03-03T21:05:18+01:00] It is actually. In Discord I can select browser tabs of Chromium. Then please work on next items
[2026-03-03T21:17:35+01:00] Yeah, feel free to continue working on items from the TODO list.
[2026-03-03T21:22:14+01:00] Continue with some more TODO items. Maybe work on 10 after another

[2026-03-03T21:55:17+01:00] Please work on some neat TODO entries.

[2026-03-03T22:00:40+01:00] Can you autonomously work on TODO entries and when you are done with one move to the next?

[2026-03-03T23:03:21+01:00] Yeah please do it
[2026-03-04T04:48:30Z] Continue implementing features
[2026-03-04T05:06:37Z] I won't try it now. How about you autonomously work on issues on the TODO list and then work on the next when you are down. Do this for up to 10 and also make sure to commit
[2026-03-04T05:10:29Z] Oh also you might actually work on as many TODO items as you like. I will be away for one hour so please use all that time.
[2026-03-04T06:04:08Z] Yes

[2026-03-04T06:14:16Z]
# AGENTS.md instructions for /home/duda/shitcord67

<INSTRUCTIONS>
# Project Agent Instructions (Persistent)

These instructions are project-local continuity notes for future LLM instances.

## Delivery Mode
- Default to execution over discussion: implement requested features directly unless blocked.
- Minimize back-and-forth questions; ask only when a decision is truly ambiguous or high-risk.
- Keep running with follow-up improvements after tests pass.

## Continuity Logging
- First action after receiving a new user prompt: append the full prompt text to  with a timestamp.
- Treat  as a handoff journal for future LLM instances when context/token limits are hit.
- Keep entries append-only; never rewrite prior prompt entries.

## Git and Change Flow
- It is explicitly allowed to add/update local  entries during implementation.
- If  is modified, include it in the next coherent commit by default (do not leave TODO edits uncommitted).
- It is explicitly allowed to commit incremental local changes without extra confirmation.
- By default, after implementing and validating changes, create coherent local commits automatically unless the user explicitly asks not to commit.
- Do not wait for a separate please

[commit prompt after code changes.
- Use small, coherent commits with clear messages.
- Do not revert unrelated user changes.

## Product Direction
- Primary goal: Discord-like UX with strong realtime behavior.
- Prioritize transport/realtime robustness (WebSocket, HTTP/SSE, XMPP).
- Prefer feature completeness and UX polish over placeholder scaffolding.

## XMPP Direction
- Continue implementing practical XEPs where useful for UX parity.
- Favor broad compatibility and cross-platform behavior.
- Keep credentials in local ignored files when needed for testing.
- Keep  updated when XMPP capability changes.

## Content and Naming Constraints
- Keep naming independent from external reference projects.
- Do not add references to Plutonium, Sweden, or Humpus in product-facing copy.

## Validation
- Run syntax/tests after changes whenever feasible.
- Perform end-to-end checks for transport-related features.
- Record meaningful outcomes in commit messages and README when behavior changes.

## XEP Docs Policy
- XEP documents in this repo may be updated anytime, but do not fetch new external sources unless explicitly asked or granted after requesting approval.


## Skills
A skill is a set of local instructions to follow that is stored in a  file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.
### Available skills
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /home/duda/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into /skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /home/duda/.codex/skills/.system/skill-installer/SKILL.md)
### How to use skills
- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with  or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its . Read only enough to follow the workflow.
  2) When  references relative paths (e.g., ), resolve them relative to the skill directory listed above first, and only consider other paths if needed.
  3) If  points to extra folders such as , load only the specific files needed for the request; don't bulk-load everything.
  4) If  exist, prefer running or patching them instead of retyping large code blocks.
  5) If  or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from  unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
</INSTRUCTIONS>
<environment_context>
  <cwd>/home/duda/shitcord67</cwd>
  <shell>bash</shell>
</environment_context>
Please continue. • Explored
  └ Read CONTINUITY_LOG.md

• The last commits included the command palette but not status updates;
  considering task sizes and existing features, the next best step is to pick a
  manageable improvement rather than large features like full user settings or
  threads.

  Scoping local-json adapter implementation

  Planning to create a new local-json transport adapter module that integrates
  with existing bridge logic by defining an interface and resolver but without
  full relay flow integration yet; deciding to inspect message publishing for
  possible minimal usage.

• Explored
  └ Search publishRelayChannelMessage|publishRelayDirectMessage in xeps
    Read xep-upload-disco-attachments.js

• I'm defining a transport adapter interface with basic methods as a minimal
  refactor to address TODOs, without full local-json adapter implementation;
  this balances progress with available time and aligns with local mode
  behavior.

  Designing local-json adapter with interface

  I'm planning a local-json adapter using localStorage and BroadcastChannel that
  adheres to an extended transport adapter interface, merging it carefully with
  the existing adapter shape to avoid breaking current UI code.

• Explored
  └ Search type: message|relay packet|relay in xep-relay-connection-flow.js

• I'm searching for the function handling incoming relay messages in the
  presence-preferences bridge to understand its role in message processing.

• Explored
  └ Search applyRelayIncomingMessage|publishRelay in xep-presence-preferences-
           bridge.js
    Read xep-presence-preferences-bridge.js

• I'm considering implementing the local-json adapter by constructing packets
  matching the relay's structure, then feeding them to the relay message
  handler; next, I'll inspect how relay packets are built for WebSocket by
  searching sendRelayPacket usage.

• Explored
  └ Search sendRelayPacket\(|type: message in xep-presence-preferences-
bridge.js

⚠ Heads up, you have less than 5% of your weekly limit left. Run /status for a
  breakdown.

• Explored
  └ Read xep-upload-disco-attachments.js

• I'm deciding to extend the existing local relay mode to support a local-json
  adapter that broadcasts across tabs by sending messages via
  applyRelayIncomingMessage, updating publishRelayChannelMessage and related
  functions to allow local mode to send and receive without network.

  Designing local relay adapter with BroadcastChannel

  I'm planning to implement the local adapter using a BroadcastChannel named for
  inter-tab messaging and localStorage for history. I'll add a BroadcastChannel
  listener in the presence-preferences bridge to receive packets and invoke
  applyRelayIncomingMessage, triggering UI refreshes appropriately.

• Explored
  └ Search scheduleRelayUiRefresh|relayUiRefresh in xep-presence-preferences-
           bridge.js

• I'm outlining how to extend message publishing to support a local relay
  mode, storing recent history in localStorage under a key and sending packets
  via a new local relay send helper integrated into existing publish functions
  for channels and directs.

  Designing local relay channel with per-tab client ID

  I'm planning a local BroadcastChannel adapter handling only chat messages,
  using a per-tab unique client ID to distinguish tabs and avoid message
  duplication locally. This includes storing recent chat history per room in
  localStorage and initializing the channel at app startup to receive messages
  across tabs.

■ Error running remote compact task: You've hit your usage limit. To continue]


[2026-03-04T06:14:16Z]
# AGENTS.md instructions for /home/duda/shitcord67

<INSTRUCTIONS>
# Project Agent Instructions (Persistent)

These instructions are project-local continuity notes for future LLM instances.

## Delivery Mode
- Default to execution over discussion: implement requested features directly unless blocked.
- Minimize back-and-forth questions; ask only when a decision is truly ambiguous or high-risk.
- Keep running with follow-up improvements after tests pass.

## Continuity Logging
- First action after receiving a new user prompt: append the full prompt text to `CONTINUITY_LOG.md` with a timestamp.
- Treat `CONTINUITY_LOG.md` as a handoff journal for future LLM instances when context/token limits are hit.
- Keep entries append-only; never rewrite prior prompt entries.

## Git and Change Flow
- It is explicitly allowed to add/update local `TODO` entries during implementation.
- If `TODO` is modified, include it in the next coherent commit by default (do not leave TODO edits uncommitted).
- It is explicitly allowed to commit incremental local changes without extra confirmation.
- By default, after implementing and validating changes, create coherent local commits automatically unless the user explicitly asks not to commit.
- Do not wait for a separate "please commit" prompt after code changes.
- Use small, coherent commits with clear messages.
- Do not revert unrelated user changes.

## Product Direction
- Primary goal: Discord-like UX with strong realtime behavior.
- Prioritize transport/realtime robustness (WebSocket, HTTP/SSE, XMPP).
- Prefer feature completeness and UX polish over placeholder scaffolding.

## XMPP Direction
- Continue implementing practical XEPs where useful for UX parity.
- Favor broad compatibility and cross-platform behavior.
- Keep credentials in local ignored files when needed for testing.
- Keep `SUPPORTED_XEPS.md` updated when XMPP capability changes.

## Content and Naming Constraints
- Keep naming independent from external reference projects.
- Do not add references to Plutonium, Sweden, or Humpus in product-facing copy.

## Validation
- Run syntax/tests after changes whenever feasible.
- Perform end-to-end checks for transport-related features.
- Record meaningful outcomes in commit messages and README when behavior changes.

## XEP Docs Policy
- XEP documents in this repo may be updated anytime, but do not fetch new external sources unless explicitly asked or granted after requesting approval.


## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.
### Available skills
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /home/duda/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /home/duda/.codex/skills/.system/skill-installer/SKILL.md)
### How to use skills
- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2) When `SKILL.md` references relative paths (e.g., `scripts/foo.py`), resolve them relative to the skill directory listed above first, and only consider other paths if needed.
  3) If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  4) If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  5) If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
</INSTRUCTIONS>
<environment_context>
  <cwd>/home/duda/shitcord67</cwd>
  <shell>bash</shell>
</environment_context>
Please continue. • Explored
  └ Read CONTINUITY_LOG.md

• The last commits included the command palette but not status updates;
  considering task sizes and existing features, the next best step is to pick a
  manageable improvement rather than large features like full user settings or
  threads.

  Scoping local-json adapter implementation

  Planning to create a new local-json transport adapter module that integrates
  with existing bridge logic by defining an interface and resolver but without
  full relay flow integration yet; deciding to inspect message publishing for
  possible minimal usage.

• Explored
  └ Search publishRelayChannelMessage|publishRelayDirectMessage in xeps
    Read xep-upload-disco-attachments.js

• I'm defining a transport adapter interface with basic methods as a minimal
  refactor to address TODOs, without full local-json adapter implementation;
  this balances progress with available time and aligns with local mode
  behavior.

  Designing local-json adapter with interface

  I'm planning a local-json adapter using localStorage and BroadcastChannel that
  adheres to an extended transport adapter interface, merging it carefully with
  the existing adapter shape to avoid breaking current UI code.

• Explored
  └ Search type: "message"|relay packet|relay in xep-relay-connection-flow.js

• I'm searching for the function handling incoming relay messages in the
  presence-preferences bridge to understand its role in message processing.

• Explored
  └ Search applyRelayIncomingMessage|publishRelay in xep-presence-preferences-
           bridge.js
    Read xep-presence-preferences-bridge.js

• I'm considering implementing the local-json adapter by constructing packets
  matching the relay's structure, then feeding them to the relay message
  handler; next, I'll inspect how relay packets are built for WebSocket by
  searching sendRelayPacket usage.

• Explored
  └ Search sendRelayPacket\(|type: "message" in xep-presence-preferences-
bridge.js

⚠ Heads up, you have less than 5% of your weekly limit left. Run /status for a
  breakdown.

• Explored
  └ Read xep-upload-disco-attachments.js

• I'm deciding to extend the existing "local" relay mode to support a local-json
  adapter that broadcasts across tabs by sending messages via
  applyRelayIncomingMessage, updating publishRelayChannelMessage and related
  functions to allow "local" mode to send and receive without network.

  Designing local relay adapter with BroadcastChannel

  I'm planning to implement the local adapter using a BroadcastChannel named for
  inter-tab messaging and localStorage for history. I'll add a BroadcastChannel
  listener in the presence-preferences bridge to receive packets and invoke
  applyRelayIncomingMessage, triggering UI refreshes appropriately.

• Explored
  └ Search scheduleRelayUiRefresh|relayUiRefresh in xep-presence-preferences-
           bridge.js

• I'm outlining how to extend message publishing to support a "local" relay
  mode, storing recent history in localStorage under a key and sending packets
  via a new local relay send helper integrated into existing publish functions
  for channels and directs.

  Designing local relay channel with per-tab client ID

  I'm planning a local BroadcastChannel adapter handling only chat messages,
  using a per-tab unique client ID to distinguish tabs and avoid message
  duplication locally. This includes storing recent chat history per room in
  localStorage and initializing the channel at app startup to receive messages
  across tabs.

■ Error running remote compact task: You've hit your usage limit. To continue

[2026-03-04T06:19:05Z]
You are also free to work autonomously on ten other things after you are done. I will be away for an hour so can't tell you stuff, please decide everything on your own

[2026-03-04T07:32:09Z]
Yeah

[2026-03-04T07:35:10Z]
Yeah
[2026-03-04T08:25:35Z]
USER PROMPT:
Okay I have no idea about this, can you write this down in a more explained file so I can test it later?
Then user reported additional issues and provided extensive runtime/XMPP logs, including:
- Link unfurl request: use HTML meta properties for page previews; YouTube should show richer preview/embed when possible.
- Broken GIF rendering for `archuser.de/the-rock.gif`.
- SWF rendering request: hide URL for SWF messages.
- SWF UI lag: when SWF controls are open and scrolling/moving away, the Ruffle area should move instantly.
- Calling issues: invites visible but call establishment/media often fails with Movim and Dino.
- Incoming call from Movim not properly received.
- Dino interop details including repeated Jingle errors and one key error:
  `feature-not-implemented: can't process multiple content nodes` on transport-info.
- Multiple snippets showing `service-unavailable` / `User session not found` / `User session terminated` and unsuccessful call teardown behavior.
- User asks for this to be written down clearly for later testing.
[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]
USER PROMPT:
Yeah do all of that. Oh also user avatars seem to be broken and when I use /shrug I get lol ¯S67_ESC_95;(ツ)_/¯. Then could I at least have an option to show the password while I'm typing (checkbox)
[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]
USER PROMPT:
Then please make Remember login save the credentials on Android. Ask for storage permissions. And then put the JSON in the Documents folder.
[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]
USER PROMPT:
Then I noticed when I interact with the privacy gateway that the media seems to not load instantly after accepting it?!
[2026-03-04T08:47:43Z]
User prompt (verbatim summary): Reports regressions including missing YouTube video/player preview, missing fallback avatar letters (self and DM peers), Movim call issues, Dino call invite visibility regressions, /shrug rendering wrong (shows fullwidth slash/backslash variants), devtools not working, repeated spam reloading/fetching of archuser.de/the-rock.gif causing many 404s, CORS/fetch errors for non-direct GIF pages, Chromium /tmp shared memory errors, and asks why archuser.de/the-rock.gif is not formatted as a link. Provided extensive XMPP logs showing call flows and transport-info errors: feature-not-implemented "can't process multiple content nodes", and session-terminate "User session not found".
[2026-03-04T08:47:43Z]
User prompt: "Oh also I think the sed-like syntax to edit the last message doesn't work. E.g. s/old/new/"
2026-03-04T08:52:29Z User prompt: "Oh also I think the sed-like syntax to edit the last message doesn't work. E.g. s/old/new/"

[2026-03-04T09:41:30Z] Feel free to work on issues and features from TODO. I'm going to make me food and are afk for 20 minutes so you are free to autonoumously work for that time. Just never ask me anything, just continue working and polishing stuff, you can also check our xmppmessengers directory for cloned XMPP clients that have some XEPs you might want to work on and get inspiration or solutions from there. Have fun.

[2026-03-04T09:51:29Z] So I noticed something: /shrug still doesn't print out ¯\_(ツ)_/¯. Fix this. Then on Android the  video player is still broken, while funnily in the preview before sending a file I can see that it is playing the video?! Also I noticed the Ruffle instances are still not instantly following on Android when I scroll in the chat, they have a delay. Any way to fix this or improve performance/delay here? Oh also could you make sure to show the user dropdown even when just ONE account is stored? And maybe don't pre-fill fields. Also please store language setting on the device and just show a flag for the selected language at the login screen so we can still switch it.

[2026-03-04T10:00:02Z] 10:51:19 ~/shitcord67:$ ./build-all.sh ... Why does my DM chat hang? Also devtools are still not open-able... please really investigate how we can ship them enabled with electron binary. Also for some reason on X11 Ctrl+Shift+I is stolen from other applications?! You know that I might have multiple browsers open and Ctrl+Shift+I needs to work in all of them?

[2026-03-04T10:25:53Z] Well, the instances should pause while they are outside of the chat window anyways?

[2026-03-04T10:38:24Z] 11:29:55 ~/shitcord67:$ ... Why am I spammed when most of the Ruffle players are all outside the current visible chat when I open it? How about you load them when first encountered?!

[2026-03-04T10:48:59Z] Loading SWF... is all I see now?! ... (long log)
2026-03-04T12:34:53+01:00 | Does the SWF audio actually correctly change? I see the Audio Active badge changes but still one previous SWF audio is playing? Oh also could you show the badges Audio Active and Runtime stable maybe at the very right in the same line as the file name for SWF?
2026-03-04T12:36:35+01:00 | Btw. is there no border indicator for the Audio pinning for SWF controls?
2026-03-04T12:47:28+01:00 | Then the Copy Logs button doesn't work. Then I don't see call notification for calls from Movim ... Also why is the input/output selection so fiddely, it auto-closes pretty fast? Please prevent the auto-close and give me real Discord-like selection for input and output. Then can you try on getting OMEMO to work? When I enable it in chat then others don't even receive my messages at all, not even showing that the message is encrypted... (very long prompt with extensive XMPP logs and Electron runtime output provided in chat)
2026-03-04T12:52:19+01:00 | can't you keep the ruffle instance alive?

[2026-03-04T12:53:17+01:00] USER PROMPT: Please continue working on your earlier task before that!
[2026-03-04T] USER PROMPT: And when you are down with everything then fix the video playback on Android. Cause for some reason when I select a mp4 from the file system then I can see it before sending in shitcord67 and it is playing. But in chat itself it just shows a broken file icon. Also the Android app still does not add any padding for users with notch and virtual navigation buttons. Please really investigate Android documentation. You may also write a script to download all Android documentation for future offline usage... Also same for Chromium and electron documentation cause I want to figure out why I just can't get the chrome/electron developer tools to show up in my application.  Oh also could it be that you have embedded the Ruffle within the messages now and thus the SWF PiP doesn't show the Ruffle instance anymore Can you try to fix this?
[2026-03-04T] USER PROMPT: When you are done with this later then: Btw. I plan to make shitcord67 to look as close 1:1 UI wise as possible (ofc excluding shitcord67-unique features). Maybe it would help if we could keep a mapping of HTML elements so we know the names in Discord (and later maybe Fluxer or other messengers that look a bit like Discord) and the saner named equivalents in shitcord67? Note that down for future LLMs btw.

[2026-03-04T13:02:39+01:00] USER PROMPT
When you are done with this later then: Btw. I plan to make shitcord67 to look as close 1:1 UI wise as possible (ofc excluding shitcord67-unique features). Maybe it would help if we could keep a mapping of HTML elements so we know the names in Discord (and later maybe Fluxer or other messengers that look a bit like Discord) and the saner named equivalents in shitcord67? Note that down for future LLMs btw.

[2026-03-04T13:02:42+01:00] USER PROMPT
And note down that the LLM is always free to improve a XEP or implement a new one when it makes sense.

[2026-03-04T13:03:52+01:00] USER PROMPT
Can you work on that?
2026-03-04T12:37:58Z
Please look at the questions file and from there at other files and then get to work.


[2026-03-04 14:14:29 +0100] › Can you continue working on where you left off?

## 2026-03-04T15:30:41+01:00
User prompt (full request summary with attached runtime logs):
- After leaving a chat + SWF, destroy Ruffle instances for that chat that are not in SWF PiP after 1 minute.
- Movim calls: invite not visible / never establishes; Dino incoming call appears but Dino reports "Call failed to establish".
- Outgoing calls: both Movim and Dino get invites; Movim never establishes; Dino establishes with one-way media UX issues.
- Audio output routing issue: remote Dino audio not redirected to selected sink.
- Device pickers reset to default immediately when selecting audio/webcam.
- Do not share webcam by default.
- For video calls, show webcam selection before sharing.
- Fix devtools not working in packaged Electron run.
- User provided extensive logs showing Jingle/JMI/call-invite interop, including errors like:
  - `mismatching creator` on content-modify.
  - `unknown content` on transport-info for video content not negotiated.
  - repeated CORS fetch failures against meet.jit.si URL checks.
  - `Uncaught TypeError: Cannot set properties of undefined (setting 'callAudioOutputId')` in xep-native-call-ui-runtime.js.
  - optional bundled runtimes missing for ruffle/dotlottie.
- Online sidebar UX:
  - Presence indicator should be outside/overlay avatar as uncut round circle.
  - Research Discord blog nameplates and make nameplates fancy using SVG SMIL in online sidebar.
- Implement some TODO items.
- Android:
  - Add button on login screen to request storage permission.
  - After grant, read stored credentials from Documents folder.
  - Investigate chat title behind notch on Android 15 (needs top padding like Discord).
  - Investigate content drawing below virtual nav bar (missing bottom insets/padding).
  - Investigate SWF PiP broken on Android (SWFs stay in chat instead of PiP).
- Media support:
  - Investigate why .wav has no audio player.
- Desktop Linux/X11:
  - Investigate Xdnd drag-and-drop not appearing in draft media preview.
- UX request:
  - Bigger media preview than circle, or click circle to expand preview before send.
- Also asked whether Android/electron/Chromium documentation was downloaded.

## 2026-03-04T15:53:16+01:00
User prompt: Yes do all

## 2026-03-04T16:38:46+01:00
USER PROMPT:
Okay for some reason I still can't hear the Dino user when we are calling but I can at least now select a output source but then it creates a bunch of sources on my system?!

## 2026-03-04T16:41:48+01:00
USER PROMPT:
When I click "Allow Docs access" in Android then no permission dialog pops up. And in apps settings I can't grant the apps permissions either. Is it even correctly having permissions settings defined as something that can be granted in Android config files manifest xml gradle or wherer they have to?

## 2026-03-04T16:46:01+01:00
USER PROMPT:
Then I noticed the SWF PiP dragging in Android is a bit sluggish. Also why can't I drag the PiP a bit lower, basically until above the message input field, similar to how it is on Desktop? Then is there a way to improve the scrolling performance in chat for Ruffle? Cause the Ruffle instances lag a bit behind on Android when I scroll. Then can you look ad the top and bottom padding before any app content? I copied some Android docs to the docs folder so maybe there is something that can help you or look up the iternet. I use Android 15 and I have a notch and virtual navigation bar (navbar) and thus some elements are hidden by those and thus we would need to draw gray borders above and below to shift the interactive interface within the area I can react at!
