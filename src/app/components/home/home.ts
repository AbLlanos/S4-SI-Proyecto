import { AfterViewInit, Component, signal } from '@angular/core';
import { Carrusel } from "../general/carrusel/carrusel";
import { Tarjetas } from "../general/tarjetas/tarjetas";
import { Footer } from "../general/footer/footer";

@Component({
  selector: 'app-home',
  imports: [Carrusel, Tarjetas, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit {

  protected readonly title = signal('S4-SI-Proyecto');

  ngAfterViewInit() {

    /* =======================================================
       🔥 FONDO MATRIX (tu código original, COMPLETO)
    ======================================================= */

    const canvas = document.getElementById('matrix-bg') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%";
    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) drops[i] = Math.random() * canvas.height / fontSize;

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    setInterval(draw, 50);

    /* =======================================================
       🔥 ANIMACIÓN DE ESTADÍSTICAS (Números que suben)
    ======================================================= */

    const stats = document.querySelectorAll('.stat-number');

    stats.forEach(stat => {
      const target = Number(stat.getAttribute('data-target'));
      let count = 0;

      const update = () => {
        count += Math.ceil(target / 100);
        if (count < target) {
          stat.textContent = count.toString();
          requestAnimationFrame(update);
        } else {
          stat.textContent = target.toString();
        }
      };
      update();
    });

    /* =======================================================
       🔥 FAQ – Acordeones animados
    ======================================================= */

    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(q => {
      q.addEventListener('click', () => {
        const answer = q.nextElementSibling as HTMLElement;

        if (answer.style.display === "block") {
          answer.style.display = "none";
        } else {
          answer.style.display = "block";
        }
      });
    });

  }
}