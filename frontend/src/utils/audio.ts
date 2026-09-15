// Sintetizador nativo de áudio para os sons da Urna Eletrônica
class AudioUrna {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Beep curto ao pressionar teclas
  public tocarTecla(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignora erro se áudio não for permitido antes de interação
    }
  }

  // Som clássico da confirmação do voto na Urna
  public tocarFim(): void {
    try {
      const ctx = this.getContext();
      const agora = ctx.currentTime;

      // Primeiro tom intermediário
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(800, agora);
      gain1.gain.setValueAtTime(0.2, agora);
      gain1.gain.setValueAtTime(0.2, agora + 0.2);
      gain1.gain.exponentialRampToValueAtTime(0.001, agora + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(agora);
      osc1.stop(agora + 0.25);

      // Tom agudo característico contínuo
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1250, agora + 0.3);
      gain2.gain.setValueAtTime(0.25, agora + 0.3);
      gain2.gain.setValueAtTime(0.25, agora + 1.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, agora + 1.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(agora + 0.3);
      osc2.stop(agora + 1.4);
    } catch {
      // Ignora erro se áudio não for permitido
    }
  }
}

export const sonsUrna = new AudioUrna();