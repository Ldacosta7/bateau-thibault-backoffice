// connection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Bubble {
  left: string;
  duration: string;
  size: string;
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
    email: '',
    password: '',
    remember: false
  };

  showPassword  = false;
  isLoading     = false;
  isFloating    = true;
  errorMessage  = '';

  bubbles: Bubble[] = [];

  private apiUrl = 'http://127.0.0.1:8000/api/token/';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  toggleFloat(): void {
    this.isFloating = false;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading    = true;
    this.errorMessage = '';

    this.http.post(this.apiUrl, {
      username: this.loginData.email,
      password: this.loginData.password
    }).subscribe({
      next: (response) => {
        console.log('Connecté :', response);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading    = false;
        this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      }
    });
  }
}