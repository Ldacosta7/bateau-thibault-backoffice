// inscription.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Bubble {
  left:     string;
  duration: string;
  size:     string;
  delay:    string;
}

interface StrengthLabel {
  text:  string;
  class: string;
}

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent implements OnInit {

  registerData = {
    username:'',
    email:'',
    telephone:'',
    password:'',
    confirmPassword: '',
    cgu:false
  };

  showPassword = false;
  showConfirm  = false;
  isLoading    = false;
  isFloating   = true;
  strength     = 0;
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

  toggleFloat(): void { this.isFloating = false; }

  get passwordMismatch(): boolean {
    return !!this.registerData.confirmPassword &&
           this.registerData.password !== this.registerData.confirmPassword;
  }

  get strengthLabel(): StrengthLabel {
    switch (this.strength) {
      case 1:  return { text: 'Faible',    class: 'weak'   };
      case 2:  return { text: 'Moyen',     class: 'medium' };
      case 3:  return { text: 'Fort',      class: 'strong' };
      case 4:  return { text: 'Très fort', class: 'strong' };
      default: return { text: '',          class: ''       };
    }
  }

  generateBubbles(): void {
    for (let i = 0; i < 20; i++) {
      const size = Math.random() * 22 + 6;
      this.bubbles.push({
        left:     `${Math.random() * 100}%`,
        duration: `${Math.random() * 12 + 8}s`,
        size:     `${size}px`,
        delay:    `${Math.random() * 10}s`
      });
    }
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  checkPasswordStrength(): void {
    const pw = this.registerData.password;
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))        score++;
    if (/[0-9]/.test(pw))        score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    this.strength = score;
  }

  onSubmit(): void {
    if (this.isLoading || this.passwordMismatch) return;
    this.isLoading    = true;
    this.errorMessage = '';

    const username = `${this.registerData.username}`.trim();

    this.authService.register(username, this.registerData.email, this.registerData.password).subscribe({
      next: () => {
        this.authService.login(username, this.registerData.password).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isLoading = false;
            this.router.navigate(['/connexion']);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.username) {
          this.errorMessage = 'Ce nom d\'utilisateur est déjà pris.';
        } else if (err.error?.email) {
          this.errorMessage = 'Cette adresse email est déjà utilisée.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de joindre le serveur.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}