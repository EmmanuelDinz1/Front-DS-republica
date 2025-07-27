// src/app/pages/extrato/extrato.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DefaultContaLayoutComponent } from '../../components/default-conta-layout/default-conta-layout.component';
import { ApiService } from '../../services/api.service';
import { Conta, Morador } from '../../types/models';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-extrato',
  standalone: true,
  templateUrl: './extrato.component.html',
  styleUrls: ['./extrato.component.scss'],
  imports: [
    CommonModule,
    DefaultContaLayoutComponent,
    ReactiveFormsModule,
    RouterLink
  ],
  providers: [DatePipe] // Adiciona o DatePipe para formatar datas
})
export class ExtratoComponent implements OnInit {
  extratoForm!: FormGroup;
  contas: Conta[] = [];
  moradores: Morador[] = [];
  filteredContas: Conta[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private datePipe: DatePipe // Injeta o DatePipe
  ) { }

  ngOnInit(): void {
    this.iniciarFormulario();
    this.carregarDadosIniciais();
  }

  iniciarFormulario(): void {
    // Define um período padrão: do primeiro dia do mês atual até a data de hoje
    const hoje = new Date();
    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    this.extratoForm = new FormGroup({
      dataInicio: new FormControl(this.formatDate(primeiroDiaDoMes)),
      dataFim: new FormControl(this.formatDate(hoje)),
      situacao: new FormControl(''),
      moradorId: new FormControl('')
    });

    // Aplica os filtros sempre que um valor do formulário mudar
    this.extratoForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  carregarDadosIniciais(): void {
    this.isLoading = true;
    // Carrega a lista de moradores para preencher o filtro
    this.apiService.getMoradores().subscribe({
      next: (data) => {
        this.moradores = data;
        // Após carregar os moradores, busca o extrato com as datas padrão
        this.emitirExtrato();
      },
      error: (err) => {
        this.toastr.error('Falha ao carregar a lista de moradores.');
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  emitirExtrato(): void {
    if (this.extratoForm.invalid) {
      this.toastr.error('Por favor, preencha as datas de início e fim.');
      return;
    }
    this.isLoading = true;
    const { dataInicio, dataFim } = this.extratoForm.value;

    this.apiService.getExtrato(dataInicio, dataFim).subscribe({
      next: (data) => {
        this.contas = data;
        this.applyFilters(); // Aplica os filtros iniciais sobre os dados recebidos
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Falha ao buscar o extrato de contas.');
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const { situacao, moradorId } = this.extratoForm.value;
    let contasFiltradas = [...this.contas];

    if (situacao) {
      contasFiltradas = contasFiltradas.filter(c => c.situacao === situacao);
    }
    if (moradorId) {
      // Filtra se algum rateio da conta pertence ao morador selecionado
      contasFiltradas = contasFiltradas.filter(c => 
        c.rateios.some(r => r.moradorId === parseInt(moradorId))
      );
    }

    this.filteredContas = contasFiltradas;
  }

  viewContaDetails(contaId?: number): void {
    if (contaId) {
      this.router.navigate(['/conta', contaId]);
    }
  }

  // Função auxiliar para formatar a data para o formato YYYY-MM-DD
  private formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
}
