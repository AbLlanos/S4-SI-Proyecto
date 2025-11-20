import { Component } from '@angular/core';
import { Footer } from "../general/footer/footer";
import { NavBar } from "../general/nav-bar/nav-bar";

@Component({
  selector: 'app-comparar-archivos-simetrico',
  templateUrl: './comparar-archivos-simetrico.html',
  styleUrl: './comparar-archivos-simetrico.css',
  imports: [Footer, NavBar],
})
export class CompararArchivosSimetrico {
  archivo1: File | null = null;
  archivo2: File | null = null;
  hashArchivo1: string = '';
  hashArchivo2: string = '';
  veredictoHash: string = '';
  frase: string = '';

  onFileSelected1(event: any) {
    this.archivo1 = event.target.files[0] || null;
    this.hashArchivo1 = '';
    this.veredictoHash = '';
  }

  onFileSelected2(event: any) {
    this.archivo2 = event.target.files[0] || null;
    this.hashArchivo2 = '';
    this.veredictoHash = '';
  }

  async calcularHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async compararArchivosPorHash() {
    if (this.archivo1 && this.archivo2) {
      this.hashArchivo1 = await this.calcularHash(this.archivo1);
      this.hashArchivo2 = await this.calcularHash(this.archivo2);
      if (this.hashArchivo1 === this.hashArchivo2) {
        this.veredictoHash = 'Los archivos son idénticos: Integridad OK.';
      } else {
        this.veredictoHash = 'Los archivos son diferentes: Integridad comprometida.';
      }
    } else {
      this.veredictoHash = 'Por favor, selecciona ambos archivos.';
    }
  }
}
