// src/app/pages/extrato/extrato.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultContaLayoutComponent } from '../../components/default-conta-layout/default-conta-layout.component';
import { ApiService } from '../../services/api.service';
import { Conta, Morador } from '../../types/models';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-extrato',
  standalone: true,
  templateUrl: './extrato.component.html',
  styleUrls: ['./extrato.component.scss'],
  imports: [
    CommonModule,
    DefaultContaLayoutComponent,
    ReactiveFormsModule // Necessário para FormGroup e FormControl
  ]
})
export class ExtratoComponent implements OnInit {
  extratoForm!: FormGroup;
  contas: Conta[] = [];
  moradores: Morador[] = []; // Para o filtro por morador
  filteredContas: Conta[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router // Injetar Router
  ) { }

  ngOnInit(): void {
    this.extratoForm = new FormGroup({
      dataInicio: new FormControl(''),
      dataFim: new FormControl(''),
      situacao: new FormControl(''), // Pode ser 'PAGO', 'EM_ABERTO', '' (todos)
      moradorId: new FormControl('') // ID do morador para filtro
    });

    this.loadData();

    // Re-filtra as contas sempre que os valores do formulário mudam
    this.extratoForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadData(): void {
    this.isLoading = true;
    // Pega os valores do formulário para passar ao serviço
    const { dataInicio, dataFim } = this.extratoForm.value; // Adicione esta linha para pegar os valores

    // Chama o getExtrato com os argumentos necessários
    this.apiService.getExtrato(dataInicio ?? '', dataFim ?? '').subscribe({ // <--- CORRIGIDO AQUI
        next: (data) => {
            this.contas = data;
            this.applyFilters();
            this.isLoading = false;
        },
        error: (err) => {
            this.toastr.error('Erro ao carregar extrato de contas.');
            console.error(err);
            this.isLoading = false;
        }
    });

    // Carrega moradores para o filtro
    this.apiService.getMoradores().subscribe({
      next: (data) => {
        this.moradores = data;
      },
      error: (err) => {
        this.toastr.error('Erro ao carregar moradores para o filtro.');
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    const { dataInicio, dataFim, situacao, moradorId } = this.extratoForm.value;

    this.filteredContas = this.contas.filter(conta => {
      const contaDate = new Date(conta.dataVencimento);
      const start = dataInicio ? new Date(dataInicio) : null;
      const end = dataFim ? new Date(dataFim) : null;

      const matchesDate = (!start || contaDate >= start) && (!end || contaDate <= end);
      const matchesSituacao = !situacao || conta.situacao === situacao;
      const matchesMorador = !moradorId || conta.rateios.some(r => r.moradorId === parseInt(moradorId));

      return matchesDate && matchesSituacao && matchesMorador;
    });
  }

  // NOVO MÉTODO: Navegar para a tela de detalhes/edição da conta
  viewContaDetails(contaId: number): void {
    this.router.navigate(['/conta', contaId]);
  }

  // NOVO MÉTODO: Emitir Extrato (placeholder)
  emitirExtrato(): void {
    const { dataInicio, dataFim, situacao, moradorId } = this.extratoForm.value;
    let message = 'Extrato gerado com os seguintes filtros: ';
    if (dataInicio) message += `De: ${dataInicio} `;
    if (dataFim) message += `Até: ${dataFim} `;
    if (situacao) message += `Situação: ${situacao} `;
    if (moradorId) {
      const morador = this.moradores.find(m => m.id === parseInt(moradorId));
      if (morador) message += `Morador: ${morador.nome} `;
    }
    if (!dataInicio && !dataFim && !situacao && !moradorId) {
      message = 'Extrato gerado para todas as contas.';
    }

    this.toastr.info(message + '. (Funcionalidade de exportação real a ser implementada no backend e frontend)');
    // Aqui você integraria a lógica real para gerar e baixar o extrato (PDF, CSV, etc.)
    // Ex: this.apiService.downloadExtrato(dataInicio, dataFim, situacao, moradorId).subscribe(...)
  }
}