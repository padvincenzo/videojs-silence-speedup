# Silence SpeedUp VideoJS plugin
VideoJS plugin that dynamically adjusts playback speed when silences are detected in the video. The actual silences timestamps must be given to the plugin.
It allows you to either speed up or skip silences entirely, providing a smoother viewing experience.

## Installation

Install via npm:
```sh
npm install videojs-silence-speedup
```

Or include it directly in your project:
```html
<link rel="stylesheet" type="text/css" href="path/to/videojs-silence-speedup/dist/videojs-silence-speedup.css">
<script src="path/to/videojs-silence-speedup/dist/videojs-silence-speedup.min.js"></script>
```

## Usage

To use the plugin, initialize it with Video.js:
```js
const player = videojs('my-video', {
  plugins: {
    silenceSpeedUp: {
      silenceSpeed: 8,
      playbackSpeed: 1,
      skipSilences: false,
      displayRealRemainingTime: true
    }
  }
});
```

## Plugin Options

The plugin supports the following options:

- **`silenceSpeed`** (`number`): Defines the playback speed during silences. Default is `8`.
- **`playbackSpeed`** (`number`): Defines the normal playback speed. Default is `1`.
- **`timestamps`** (`Array<{t_start: number, t_end: number}>`): An array of objects defining silence start and end times. Default is an empty array.
- **`skipSilences`** (`boolean`): If `true`, silences will be automatically skipped instead of sped up. Default is `false`.
- **`displayRealRemainingTime`** (`boolean`): If `true`, updates the remaining time display to reflect adjusted playback speed. Default is `true`.

## Events

The plugin emits the following event:

- **`silence-skipped`**: Triggered when a silence is skipped by the player.

Example:
```js
player.on('silence-skipped', (event) => {
  console.log('Skipped to:', player.currentTime());
});
```

## Available Methods

The following methods are available to control the plugin:

- **`isInSilence(): boolean`** – Returns `true` if the player is currently in a silence segment.
- **`getCurrent(): {t_start: number, t_end: number} | undefined`** – Returns the current silence object, or `undefined` if not in silence.
- **`skipCurrentSilence(): void`** – Skips the current silence segment.
- **`setPlaybackSpeed(rate: number): void`** – Updates the normal playback speed (range: `0.2` to `20`).
- **`getPlaybackSpeed(): number`** – Returns the current normal playback speed.
- **`setSilenceSpeed(rate: number): void`** – Updates the silence playback speed (range: `0.2` to `20`).
- **`getSilenceSpeed(): number`** – Returns the current silence playback speed.
- **`setSilenceTimestamps(timestamps: Array<{t_start: number, t_end: number}>): void`** – Updates the silence timestamps.
- **`getSilenceTimestamps(): Array<{t_start: number, t_end: number}>`** – Returns the list of silence timestamps.

## Example Implementation

```js
player.setSilenceTimestamps([
  { t_start: 10, t_end: 15 },
  { t_start: 30, t_end: 35 }
]);
player.setSilenceSpeed(8);
player.setPlaybackSpeed(1.2);
```

## License
This plugin is open-source and distributed under the ISC License.
