<template>
  <div class="aurora-background">
    <div class="aurora-glow">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
      <div class="glow-orb orb-3"></div>
    </div>
    <div class="noise-layer"></div>
  </div>
</template>

<script setup>
</script>

<style>
.aurora-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background: #05070d;
}

.aurora-glow {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  /* 不用 filter: blur —— 渐变本身已足够柔和，
     blur 会让每个 900px 球体每帧重新光栅化，代价极高 */
  will-change: transform;
}

.orb-1 {
  width: 900px;
  height: 900px;
  background: radial-gradient(circle, rgba(165, 95, 255, 0.6), transparent 55%);
  top: -10%;
  left: -5%;
  animation: drift1 60s ease-in-out infinite;
}

.orb-2 {
  width: 850px;
  height: 850px;
  background: radial-gradient(circle, rgba(99, 132, 255, 0.55), transparent 55%);
  top: 30%;
  right: -10%;
  animation: drift2 72s ease-in-out infinite;
}

.orb-3 {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(34, 221, 248, 0.5), transparent 55%);
  bottom: -15%;
  left: 25%;
  animation: drift3 66s ease-in-out infinite;
}

@keyframes drift1 {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(350px, -150px) scale(1.2); }
  50% { transform: translate(200px, 100px) scale(0.9); }
  75% { transform: translate(-100px, 200px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes drift2 {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-400px, 200px) scale(1.15); }
  50% { transform: translate(-250px, -150px) scale(0.85); }
  75% { transform: translate(-100px, -300px) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes drift3 {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(300px, 250px) scale(1.25); }
  50% { transform: translate(-200px, 150px) scale(0.95); }
  75% { transform: translate(-350px, 100px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

.noise-layer {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .glow-orb {
    animation: none !important;
  }
}
</style>
