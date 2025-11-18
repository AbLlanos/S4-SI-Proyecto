import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from "./components/general/nav-bar/nav-bar";
import { Home } from "./components/home/home";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('S4-SI-Proyecto');
}
