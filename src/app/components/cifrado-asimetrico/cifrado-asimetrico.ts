import { Component } from '@angular/core';
import { NavBar } from "../general/nav-bar/nav-bar";
import { Footer } from "../general/footer/footer";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cifrado-asimetrico',
  standalone: true,
  imports: [NavBar, Footer, CommonModule, FormsModule],
  templateUrl: './cifrado-asimetrico.html',
  styleUrls: ['./cifrado-asimetrico.css']
})
export class CifradoAsimetrico {

  clavePublica: string = '';
  clavePrivada: string = '';
  textoPlano: string = '';
  resultadoCifrado: string = '';
  estado: string = '';
  keyPair?: CryptoKeyPair;

  constructor() { }

  async generarParClaves() {
    try {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      );

      this.clavePublica = await this.exportarClave(this.keyPair.publicKey, 'spki');
      this.clavePrivada = await this.exportarClave(this.keyPair.privateKey, 'pkcs8');
      this.estado = '[translate:Claves generadas correctamente]';
    } catch (e) {
      this.estado = '[translate:Error generando claves:] ' + (e as Error).message;
    }
  }

  async exportarClave(key: CryptoKey, formato: 'spki' | 'pkcs8'): Promise<string> {
    const exported = await window.crypto.subtle.exportKey(formato, key);
    return this.arrayBufferToBase64(exported);
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async cifrarTexto() {
    try {
      if (!this.keyPair || !this.keyPair.publicKey) {
        this.estado = '[translate:Primero genera las claves]';
        return;
      }
      if (!this.textoPlano.trim()) {
        this.estado = '[translate:Ingrese texto para encriptar]';
        return;
      }
      const encoded = new TextEncoder().encode(this.textoPlano);
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP"
        },
        this.keyPair.publicKey,
        encoded
      );
      this.resultadoCifrado = this.arrayBufferToBase64(encrypted);
      this.estado = '[translate:Texto encriptado correctamente]';
    } catch (e) {
      this.estado = '[translate:Error en cifrado:] ' + (e as Error).message;
    }
  }

  async desencriptarTexto() {
    try {
      if (!this.keyPair || !this.keyPair.privateKey) {
        this.estado = '[translate:Primero genera las claves]';
        return;
      }
      if (!this.resultadoCifrado.trim()) {
        this.estado = '[translate:Ingrese texto cifrado para desencriptar]';
        return;
      }
      const encryptedBuffer = this.base64ToArrayBuffer(this.resultadoCifrado);
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        this.keyPair.privateKey,
        encryptedBuffer
      );
      this.textoPlano = new TextDecoder().decode(decrypted);
      this.estado = '[translate:Texto desencriptado correctamente]';
    } catch (e) {
      this.estado = '[translate:Contraseña incorrecta o datos corruptos. No se pudo descifrar.]';
    }
  }
}
