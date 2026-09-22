<script lang="ts">
  import { loadBarcodeReader } from '../off/scanner';

  let { ondetect, oncancel }: { ondetect: (code: string) => void; oncancel: () => void } =
    $props();

  let video = $state<HTMLVideoElement>();
  let status = $state<'starting' | 'scanning' | 'error'>('starting');
  let message = $state('');

  function describe(error: unknown): string {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return 'Kein Zugriff auf die Kamera. Du kannst ihn in den Safari-Einstellungen erlauben.';
      }
      if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
        return 'Es wurde keine passende Kamera gefunden.';
      }
    }
    return 'Der Scanner konnte nicht gestartet werden. Gib den Barcode einfach von Hand ein.';
  }

  $effect(() => {
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    let stopped = false;

    async function start() {
      try {
        const reader = await loadBarcodeReader();
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (stopped) return;

        const element = video;
        if (!element) return;
        element.srcObject = stream;
        await element.play();
        status = 'scanning';

        timer = setInterval(async () => {
          if (stopped || element.readyState < 2) return;
          try {
            const codes = await reader.detect(element);
            const code = codes[0]?.rawValue;
            if (code) {
              stopped = true;
              ondetect(code);
            }
          } catch {
            // Einzelne Bilder duerfen fehlschlagen; der naechste Versuch folgt.
          }
        }, 350);
      } catch (error) {
        if (stopped) return;
        status = 'error';
        message = describe(error);
      }
    }

    void start();

    return () => {
      stopped = true;
      if (timer !== undefined) clearInterval(timer);
      for (const track of stream?.getTracks() ?? []) track.stop();
    };
  });
</script>

<div class="scanner">
  {#if status === 'error'}
    <p class="message" role="alert">{message}</p>
    <button type="button" class="btn btn-secondary" onclick={oncancel}>Zurück</button>
  {:else}
    <div class="frame">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video bind:this={video} playsinline muted></video>
      <div class="reticle" aria-hidden="true"></div>
    </div>
    <p class="message">
      {status === 'starting' ? 'Kamera wird gestartet …' : 'Barcode in den Rahmen halten.'}
    </p>
  {/if}
</div>

<style>
  .scanner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .frame {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-card);
    overflow: hidden;
    background: #000000;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .reticle {
    position: absolute;
    left: 10%;
    right: 10%;
    top: 34%;
    height: 32%;
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.35);
  }

  .message {
    margin: 0;
    font-size: 15px;
    line-height: 1.4;
    color: var(--text-2);
    text-align: center;
  }

  .btn {
    width: 100%;
  }
</style>
