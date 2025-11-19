import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // IMPORTANTE para *ngFor

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule], // <-- aquí ponemos CommonModule
  templateUrl: './carrusel.html',
  styleUrls: ['./carrusel.css'], // <-- corregido
})
export class Carrusel {
  slides = [
    'https://cdn.pixabay.com/photo/2024/07/26/19/49/hacker-8924230_1280.png',
    'https://cdn.pixabay.com/photo/2023/11/05/02/07/ai-generated-8366100_1280.jpg',
    'https://cdn.pixabay.com/photo/2023/06/01/17/25/hacker-8033977_1280.jpg'
  ];

  currentSlide = 0;

  next() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prev() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }
}
