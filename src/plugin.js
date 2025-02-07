/**
 * This file is part of videojs-silence-speedup, a VideoJS plugin
 * that speed-up the video on given silences timestamps.
 *
 * @author Vincenzo Padula <padvincenzo@gmail.com>
 * @copyright 2025
 * @license ISC
 */

import videojs from 'video.js';

const Plugin = videojs.getPlugin('plugin');

class SilenceSpeedUp extends Plugin {
    static DEFAULTS = {
        playbackSpeed: 1,
        silenceSpeed: 8,
        timestamps: [],
        skipSilences: false,
        displayRealRemainingTime: true
    };

    #playbackSpeed;
    #silenceSpeed;
    #skipSilences;
    #displayRealRemainingTime;
    #timestamps = [];
    #nextEnd = 0;
    #skipSilenceBtn;
    #remainingTimeDisplay;
    #currentRemainingTimeDisplay;

    #initSkipButton() {
        this.#skipSilenceBtn = document.createElement("div");
        this.#skipSilenceBtn.classList.add("vjs-skip-silence");
        this.player.el().appendChild(this.#skipSilenceBtn);

        this.#skipSilenceBtn.addEventListener("click", () => {
            this.skipCurrentSilence();
        });
    }

    #initRemainingTimeDisplay() {
        this.#remainingTimeDisplay = document.createElement("span");
        this.#remainingTimeDisplay.classList.add("vjs-silence-speedup-remaining-time-display");

        this.player.ready(() => {
            this.#currentRemainingTimeDisplay = this.player.el().querySelector(".vjs-remaining-time-display");
            this.#currentRemainingTimeDisplay.parentNode.insertBefore(this.#remainingTimeDisplay, this.#currentRemainingTimeDisplay);

            if (this.#displayRealRemainingTime) {
                this.#currentRemainingTimeDisplay.style.display = "none";
            } else {
                this.#remainingTimeDisplay.style.display = "none";
            }
        });
    }

    #initEventListeners() {
        this.player.on("timeupdate", (e) => {
            let currentTime = +this.player.currentTime();
            let currentSilence = this.getCurrent(currentTime);

            if (currentSilence) {
                if (this.#skipSilences) {
                    this.skipCurrentSilence();
                } else {
                    this.player.playbackRate(this.#silenceSpeed);
                }
                this.#skipSilenceBtn.style.display = "inline-block";
                this.#nextEnd = currentSilence.t_end;
            } else {
                this.player.playbackRate(this.#playbackSpeed);
                this.#skipSilenceBtn.style.display = "none";
                this.#nextEnd = 0;
            }

            if (this.#displayRealRemainingTime) {
                this.#updateRemainingTime(currentTime);
            }
        });
    }

    constructor(player, options) {
        super(player, options);

        this.options = { ...SilenceSpeedUp.DEFAULTS, ...options };
        this.#playbackSpeed = Math.max(0.2, Math.min(20, +this.options.playbackSpeed)).toFixed(1);
        this.#silenceSpeed = Math.max(0.2, Math.min(20, +this.options.silenceSpeed)).toFixed(1);
        this.#skipSilences = this.options.skipSilences;
        this.#displayRealRemainingTime = this.options.displayRealRemainingTime;
        this.setSilenceTimestamps(this.options.timestamps);

        this.#initSkipButton();
        this.#initRemainingTimeDisplay();
        this.#initEventListeners();
    }

    skipCurrentSilence() {
        if (this.#nextEnd !== 0) {
            this.player.currentTime(this.#nextEnd);
            this.player.trigger('silence-skipped', { skippedTo: this.#nextEnd });
        }
    }

    setSilenceTimestamps(_timestamps = []) {
        // TODO: Improve margin with a dynamic value based on player performance.

        if (!Array.isArray(_timestamps)) {
            console.error("Silence timestamps must be an array of objects with t_start and t_end properties. Given:", _timestamps);
            this.#timestamps = [];
            return;
        }

        this.#timestamps = _timestamps
            .map((silence) => {
                return {
                    // Add an extra margin based on given speeds.
                    t_start: +silence.t_start + (this.#playbackSpeed * 0.08),
                    t_end: +silence.t_end - (this.#silenceSpeed * 0.12),
                }
            })
            .filter((silence) => silence.t_end > silence.t_start) // Remove no sense silences.
            .sort((silence1, silence2) => silence1.t_start - silence2.t_start); // Sort timestamps.

        this.#nextEnd = 0;
    }

    getSilenceTimestamps() {
        return this.#timestamps;
    }

    setPlaybackSpeed(_playbackSpeed) {
        let speed = Math.max(0.2, Math.min(20, +_playbackSpeed));
        this.#playbackSpeed = speed.toFixed(1);
    }

    setSilenceSpeed(_silenceSpeed) {
        let speed = Math.max(0.2, Math.min(20, +_silenceSpeed));
        this.#silenceSpeed = speed.toFixed(1);
    }

    getPlaybackSpeed() {
        return this.#playbackSpeed;
    }

    getSilenceSpeed() {
        return this.#silenceSpeed;
    }

    getCurrent(needle = 0) {
        if (!this.#timestamps || !Array.isArray(this.#timestamps)) {
            console.error("Silence timestamps not valid:", this.#timestamps);
            return undefined;
        }
        return this.#timestamps.find(silence => needle <= silence.t_end && needle >= silence.t_start);
    }

    isInSilence() {
        return this.#nextEnd !== 0;
    }

    #updateRemainingTime(currentTime) {
        if (!this.#timestamps || !Array.isArray(this.#timestamps)) {
            console.error("Silence timestamps not valid:", this.#timestamps);
            this.#remainingTimeDisplay.innerText = this.#secondsToTime(this.player.remainingTime());
            return;
        }

        let remainingSilences = this.#timestamps.filter(silence => silence.t_end > currentTime);
        let remainingSilenceSeconds = remainingSilences.reduce((total, silence) => total + (silence.t_end - silence.t_start), 0);
        let remainingSpokenSeconds = this.player.duration() - currentTime - remainingSilenceSeconds;
        let realRemainingSeconds = (remainingSpokenSeconds / +this.#playbackSpeed) + (remainingSilenceSeconds / +this.#silenceSpeed);

        this.#remainingTimeDisplay.innerText = this.#secondsToTime(realRemainingSeconds);
    }

    #secondsToTime(seconds) {
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = Math.floor(seconds % 60);
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

videojs.registerPlugin('silenceSpeedUp', SilenceSpeedUp);
