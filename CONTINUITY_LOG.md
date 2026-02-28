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

## ${ts}
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
