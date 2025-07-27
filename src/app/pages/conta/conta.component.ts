// src/app/pages/conta/conta.component.ts

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Adicionado ActivatedRoute
import { CommonModule } from '@angular/common';
import { DefaultContaLayoutComponent } from '../../components/default-conta-layout/default-conta-layout.component';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { ApiService } from '../../services/api.service';
import { Morador, TipoConta, ContaDTO, Conta, Rateio } from '../../types/models'; // Adicionado Conta e Rateio
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conta',
  standalone: true,
  templateUrl: './conta.component.html',
  styleUrls: ['./conta.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DefaultContaLayoutComponent,
    PrimaryInputComponent,
    RouterLink
  ]
})
export class ContaComponent implements OnInit {
  contaForm!: FormGroup;
  moradores: Morador[] = [];
  tiposConta: TipoConta[] = [];
  isLoading = true;
  contaId: number | null = null; // Para armazenar o ID da conta se estiver em modo de edição

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute, // Injetar ActivatedRoute
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Captura o ID da rota se existir (modo de edição)
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.contaId = +idParam; // Converte string para number
      }
      this.iniciarFormulario(); // Inicia o formulário primeiro
      this.carregarDadosIniciais(); // Depois carrega os dados e a conta, se houver ID
    });
  }

  // Acessador para o FormArray de rateios
  get rateios(): FormArray {
    return this.contaForm.get('rateios') as FormArray;
  }

  iniciarFormulario(conta?: Conta): void {
    this.contaForm = new FormGroup({
      tipoConta: new FormControl(conta ? conta.tipoConta.id : null, [Validators.required]),
      responsavel: new FormControl(conta ? conta.responsavel.id : null, [Validators.required]),
      valor: new FormControl(conta ? conta.valor : null, [Validators.required, Validators.min(0.01)]),
      dataVencimento: new FormControl(conta ? this.formatDate(conta.dataVencimento) : '', [Validators.required]),
      observacao: new FormControl(conta ? conta.observacao : ''),
      rateios: new FormArray([], [Validators.required, Validators.minLength(1)])
    });

    // Se for edição, popula os rateios existentes
    if (conta && conta.rateios) {
      conta.rateios.forEach(rateio => {
        this.rateios.push(this.criarFormGroupRateio(rateio.moradorId, rateio.valor, rateio.status));
      });
    }
  }

  carregarDadosIniciais(): void {
    this.isLoading = true;
    forkJoin({
      moradores: this.apiService.getMoradores(),
      tiposConta: this.apiService.getTiposConta()
    }).subscribe({
      next: (response) => {
        this.moradores = response.moradores;
        this.tiposConta = response.tiposConta;

        if (this.contaId) {
          // Modo de edição: Carrega os dados da conta
          this.apiService.getContaById(this.contaId).subscribe({
            next: (contaData) => {
              this.iniciarFormulario(contaData); // Re-inicializa o formulário com os dados da conta
              this.isLoading = false;
            },
            error: (err) => {
              this.toastr.error('Falha ao carregar dados da conta para edição.');
              console.error(err);
              this.isLoading = false;
              this.router.navigate(['/contas']); // Redireciona se a conta não for encontrada
            }
          });
        } else {
          // Modo de criação: Adiciona rateio para todos os moradores
          this.adicionarRateioParaTodos();
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.toastr.error('Falha ao carregar dados iniciais para o formulário.');
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  criarFormGroupRateio(moradorId: number, valor: number = 0, status: string = 'EM_ABERTO'): FormGroup {
    return new FormGroup({
      morador: new FormControl({ id: moradorId }, Validators.required),
      valor: new FormControl(valor, [Validators.required, Validators.min(0)]),
      status: new FormControl(status) // Adicionado status para o rateio
    });
  }

  adicionarRateioParaTodos(): void {
    this.rateios.clear();
    this.moradores.forEach(morador => {
      // Inicia com status 'EM_ABERTO' para novas contas
      this.rateios.push(this.criarFormGroupRateio(morador.id, 0, 'EM_ABERTO'));
    });
  }

  removerRateio(index: number): void {
    this.rateios.removeAt(index);
  }

  dividirIgualmente(): void {
    const valorTotal = this.contaForm.get('valor')?.value;
    if (!valorTotal || this.rateios.length === 0) {
      this.toastr.info('Informe o valor total da conta e adicione moradores ao rateio primeiro.');
      return;
    }
    const valorPorPessoa = (valorTotal / this.rateios.length).toFixed(2);
    this.rateios.controls.forEach(control => {
      control.get('valor')?.setValue(parseFloat(valorPorPessoa));
    });
  }

  submit() {
    this.contaForm.markAllAsTouched(); // Para exibir mensagens de erro
    if (this.contaForm.invalid) {
      this.toastr.error('Formulário inválido. Verifique todos os campos.');
      return;
    }

    const formValue = this.contaForm.value;
    const somaRateios = formValue.rateios.reduce((acc: number, item: { valor: number; }) => acc + item.valor, 0);

    // Permitir uma pequena diferença devido a arredondamento
    if (Math.abs(somaRateios - formValue.valor) > 0.02) { // Aumentei a tolerância para 0.02
      this.toastr.error(`A soma dos rateios (${somaRateios.toFixed(2)}) não bate com o valor total da conta (${formValue.valor.toFixed(2)}).`);
      return;
    }

    const contaDto: ContaDTO = {
      observacao: formValue.observacao,
      valor: formValue.valor,
      dataVencimento: new Date(formValue.dataVencimento).toISOString().split('T')[0], // Garante YYYY-MM-DD
      responsavel: { id: formValue.responsavel },
      tipoConta: { id: formValue.tipoConta },
      // Mapear status do rateio também, se a edição permitir mudar
      rateios: formValue.rateios.map((r: any) => ({ morador: {id: r.morador.id}, valor: r.valor, status: r.status }))
    };

    if (this.contaId) {
      // Modo de edição: Chamar o método de atualização
      this.apiService.updateConta(this.contaId, contaDto).subscribe({
        next: () => {
          this.toastr.success('Conta atualizada com sucesso!');
          this.router.navigate(['/profile']); // Ou para uma lista de contas
        },
        error: (err) => {
          console.error("Erro ao atualizar conta:", err);
          let errorMessage = "Erro ao atualizar conta.";
          if (err && err.error && typeof err.error === 'string') {
            errorMessage = err.error; // Mensagem do backend
          }
          this.toastr.error(errorMessage);
        }
      });
    } else {
      // Modo de criação: Chamar o método de criação
      this.apiService.createConta(contaDto).subscribe({
        next: () => {
          this.toastr.success('Conta cadastrada com sucesso!');
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          console.error("Erro ao cadastrar conta:", err);
          let errorMessage = "Erro ao cadastrar conta.";
          if (err && err.error && typeof err.error === 'string') {
            errorMessage = err.error;
          }
          this.toastr.error(errorMessage);
        }
      });
    }
  }

  // Helper para formatar a data para o input type="date"
  private formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  getMoradorNome(moradorId: number): string {
    return this.moradores.find(m => m.id === moradorId)?.nome || 'Desconhecido';
  }
}