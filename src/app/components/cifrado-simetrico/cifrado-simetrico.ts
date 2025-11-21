import { AfterViewInit, Component, signal } from '@angular/core';
import { Footer } from "../general/footer/footer";
import { NavBar } from "../general/nav-bar/nav-bar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cifrado-simetrico',
  standalone: true,
  imports: [Footer, NavBar, CommonModule, FormsModule],
  templateUrl: './cifrado-simetrico.html',
  styleUrls: ['./cifrado-simetrico.css']
})
export class CifradoSimetrico implements AfterViewInit  {
  textoPlano: string = '';
  frase: string = '';
  archivo: File | null = null;
  resultadoCifrado: string = '';
  estado: string = '';
  nombreArchivoOTexto: string = '';

  readonly LONGITUD_SAL = 16;
  readonly LONGITUD_IV = 16;
  textEncoder = new TextEncoder();
  textDecoder = new TextDecoder();

  onFileSelected(event: any) {
    this.archivo = event.target.files[0] || null;
    this.estado = '';
    this.resultadoCifrado = '';
    this.nombreArchivoOTexto = this.archivo ? this.archivo.name : '';
  }

  private async derivarClave(contrasena: string, sal: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      this.textEncoder.encode(contrasena),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: sal.buffer as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private bufferToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer));
  }

  private base64ToBuffer(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  }

  async encriptar() {
    try {
      let datos: Uint8Array;

      if (this.archivo) {
        datos = new Uint8Array(await this.archivo.arrayBuffer());
        this.nombreArchivoOTexto = this.archivo.name;
      } else if (this.textoPlano.trim().length > 0) {
        datos = this.textEncoder.encode(this.textoPlano);
        this.nombreArchivoOTexto = 'Texto ingresado';
      } else {
        this.estado = 'No hay archivo ni texto para encriptar';
        return;
      }

      if (!this.frase.trim()) {
        this.estado = 'Ingrese la frase para derivar la clave';
        return;
      }

      const sal = window.crypto.getRandomValues(new Uint8Array(this.LONGITUD_SAL));
      const iv = window.crypto.getRandomValues(new Uint8Array(this.LONGITUD_IV));

      const clave = await this.derivarClave(this.frase, sal);

      const cifrado = await window.crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        clave,
        datos.buffer as ArrayBuffer
      );

      const combinado = new Uint8Array(sal.length + iv.length + cifrado.byteLength);
      combinado.set(sal, 0);
      combinado.set(iv, sal.length);
      combinado.set(new Uint8Array(cifrado), sal.length + iv.length);

      this.resultadoCifrado = this.bufferToBase64(combinado);
      this.estado = 'Encriptado correctamente';

      if (this.archivo) {
        const blob = new Blob([combinado], { type: 'application/octet-stream' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = this.archivo.name + '.enc';
        a.click();
        URL.revokeObjectURL(downloadUrl); 
      }

    } catch (e) {
      this.estado = 'Error en encriptar ' + (e as Error).message;
    }
  }

  async desencriptar() {
    try {
      if (!this.resultadoCifrado) {
        this.estado = 'No hay texto cifrado para desencriptar';
        return;
      }
      if (!this.frase.trim()) {
        this.estado = 'Ingrese la frase para generar la clave';
        return;
      }

      const combinado = this.base64ToBuffer(this.resultadoCifrado);

      const sal = combinado.slice(0, this.LONGITUD_SAL);
      const iv = combinado.slice(this.LONGITUD_SAL, this.LONGITUD_SAL + this.LONGITUD_IV);
      const datosCifrados = combinado.slice(this.LONGITUD_SAL + this.LONGITUD_IV);

      const clave = await this.derivarClave(this.frase, sal);

      const datosDescifrados = await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        clave,
        datosCifrados.buffer as ArrayBuffer
      );

      if (this.archivo) {

        const blob = new Blob([datosDescifrados], { type: this.archivo.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.archivo.name.replace(/\.enc$/, '') || 'archivo_desencriptado';
        a.click();
        URL.revokeObjectURL(url);
        this.resultadoCifrado = `Archivo desencriptado descargado`;
      } else {
        this.resultadoCifrado = this.textDecoder.decode(datosDescifrados);
      }

      this.estado = 'Desencriptado correctamente';

    } catch (e) {
      this.estado = 'Error verifique la frase o vulva a intentarlo más tarde ';
    }
  }






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
