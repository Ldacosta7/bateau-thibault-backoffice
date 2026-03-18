// connection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Bubble {
  left:     string;
  duration: string;
  size:     string;
}

@Component({
  selector: 'app-connection',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.css']
})
export class ConnectionComponent implements OnInit {

  loginData = {
    email:    '',
    password: '',
    remember: false
  };

  showPassword = false;
  isLoading    = false;
  isFloating   = true;
  errorMessage = '';

  bubbles: Bubble[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isConnected()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.generateBubbles();
  }

  generateBubbles(): void {
    for (let i = 0; i < 18; i++) {
      const size = Math.random() * 22 + 6;
      this.bubbles.push({
        left:     `${Math.random() * 100}%`,
        duration: `${Math.random() * 12 + 8}s`,
        size:     `${size}px`
      });
    }
  }

  toggleFloat(): void    { this.isFloating   = false; }
  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de joindre le serveur.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}