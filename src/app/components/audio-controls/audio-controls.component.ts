import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, AudioState } from 'app/services/audio.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-audio-controls',
    imports: [CommonModule],
    templateUrl: './audio-controls.component.html',
    styleUrl: './audio-controls.component.scss',
})
export class AudioControlsComponent implements OnInit, OnDestroy {
    public audioState: AudioState = {
        isPlaying: false,
        currentAudio: null,
        volume: 0.5,
        isMuted: false,
    };

    private audioSubscription: Subscription | null = null;
    private lastVolume: number = 0.5; // Store the last volume before muting

    constructor(private audioService: AudioService) {}

    ngOnInit(): void {
        this.audioSubscription = this.audioService.audioState$.subscribe(
            (state) => {
                this.audioState = state;
            }
        );
    }

    ngOnDestroy(): void {
        if (this.audioSubscription) {
            this.audioSubscription.unsubscribe();
        }
    }

    /**
     * Toggle play/stop
     */
    togglePlayPauseBackgroundAudio(): void {
        console.debug('Toggle play/stop background audio');
        if (this.audioState.isPlaying) {
            this.audioService.pauseBackgroundAudio();
        } else {
            this.audioService.playBackgroundAudio().catch(console.error);
        }
    }

    /**
     * Toggle mute/unmute
     */
    toggleMute(): void {
        if (this.audioState.isMuted) {
            // Unmute and restore last volume
            this.audioService.setMuted(false);
            this.audioService.setVolume(this.lastVolume);
        } else {
            // Mute and store current volume
            this.lastVolume = this.audioState.volume;
            this.audioService.setMuted(true);
        }
    }

    /**
     * Handle volume change
     */
    onVolumeChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const volume = parseFloat(target.value);
        this.lastVolume = volume; // Update last volume
        this.audioService.setVolume(volume);
    }
}
