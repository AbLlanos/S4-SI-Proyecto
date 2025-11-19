import { Component } from '@angular/core';
import { Footer } from "../general/footer/footer";
import { NavBar } from "../general/nav-bar/nav-bar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cifrado-simetrico',
  standalone: true, // Añadido para uso independiente
  imports: [Footer, NavBar, CommonModule, FormsModule],
  templateUrl: './cifrado-simetrico.html',
  styleUrls: ['./cifrado-simetrico.css']
})
export class CifradoSimetrico {
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

  private async derivarClave(contraseña: string, sal: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      this.textEncoder.encode(contraseña),
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
        this.nombreArchivoOTexto = '[translate:Texto ingresado]';
      } else {
        this.estado = '[translate:Error: No hay archivo ni texto para encriptar]';
        return;
      }

      if (!this.frase.trim()) {
        this.estado = '[translate:Error: Ingrese la frase para derivar la clave]';
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
      this.estado = '[translate:Encriptado correctamente]';

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
      this.estado = '[translate:Error en encriptar:] ' + (e as Error).message;
    }
  }

  async desencriptar() {
    try {
      if (!this.resultadoCifrado) {
        this.estado = '[translate:Error: No hay texto cifrado para desencriptar]';
        return;
      }
      if (!this.frase.trim()) {
        this.estado = '[translate:Error: Ingrese la frase para derivar la clave]';
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
        this.resultadoCifrado = `[translate:Archivo desencriptado descargado]`;
      } else {
        this.resultadoCifrado = this.textDecoder.decode(datosDescifrados);
      }

      this.estado = '[translate:Desencriptado correctamente]';

    } catch (e) {
      this.estado = '[translate:Error en desencriptar:] ' + (e as Error).message;
    }
  }

}
