// src/app/pages/conta/conta.component.ts

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DefaultContaLayoutComponent } from '../../components/default-conta-layout/default-conta-layout.component';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { ApiService } from '../../services/api.service';
import { Morador, TipoConta, ContaDTO, Conta, Rateio } from '../../types/models'; // Importar Conta e Rateio
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-conta',
  standalone: true,
  templateUrl: './conta.component.html',
  styleUrls: ['./conta.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DefaultContaLayoutComponent,
    PrimaryInputComponent
  ]
})
export class ContaComponent implements OnInit {
  contaForm!: FormGroup;
  moradores: Morador[] = []; // Lista de todos os moradores
  tiposConta: TipoConta[] = []; // Lista de todos os tipos de conta
  isLoading = true;
  contaId: number | null = null; // ID da conta se estiver em modo de edição

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Captura o ID da rota se existir (modo de edição)
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.contaId = +idParam; // Converte string para number
      }
      this.iniciarFormulario(); // Inicia o formulário primeiro (pode ser vazio ou com dados de edição)
      this.carregarDadosIniciais(); // Depois carrega os dados e a conta, se houver ID
    });
  }

  get rateios(): FormArray {
    return this.contaForm.get('rateios') as FormArray;
  }

  // <--- CORREÇÃO CRUCIAL AQUI: Acessando tipoContaId e responsavelId diretamente
  // Este método inicializa o formulário, preenchendo com 'conta' se estiver no modo de edição.
  iniciarFormulario(conta?: Conta): void {
    this.contaForm = new FormGroup({
      // Usa tipoContaId e responsavelId diretamente, como na interface Conta
      tipoConta: new FormControl(conta ? conta.tipoContaId : null, [Validators.required]),
      responsavel: new FormControl(conta ? conta.responsavelId : null, [Validators.required]),
      valor: new FormControl(conta ? conta.valor : null, [Validators.required, Validators.min(0.01)]),
      dataVencimento: new FormControl(conta ? this.formatDate(conta.dataVencimento) : '', [Validators.required]),
      observacao: new FormControl(conta ? conta.observacao : ''),
      rateios: new FormArray([], [Validators.required, Validators.minLength(1)])
    });

    // Se estiver no modo de edição e houver rateios, preenche o FormArray
    if (conta && conta.rateios) {
      conta.rateios.forEach(rateio => {
        this.rateios.push(this.criarFormGroupRateio(rateio.moradorId, rateio.valor, rateio.status));
      });
    }
  }

  // Carrega dados iniciais (moradores, tipos de conta) e os detalhes da conta se for edição
  carregarDadosIniciais(): void {
    this.isLoading = true;
    forkJoin({
      moradores: this.apiService.getMoradores(),
      tiposConta: this.apiService.getTiposConta()
    }).subscribe({
      next: (response) => {
        this.moradores = response.moradores;
        this.tiposConta = response.tiposConta;

        if (this.contaId) { // Se for modo de edição, busca os detalhes da conta
          this.apiService.getContaById(this.contaId).subscribe({
            next: (contaData) => {
              this.iniciarFormulario(contaData); // Re-inicializa o formulário com os dados da conta
              this.isLoading = false;
              console.log('ContaComponent: Dados da conta para edição carregados:', contaData);
            },
            error: (err: HttpErrorResponse) => {
              this.toastr.error('Falha ao carregar dados da conta para edição.');
              console.error(err);
              this.isLoading = false;
              // Redireciona em caso de erro (ex: conta não encontrada, permissão negada)
              if (err.status === 401 || err.status === 403 || err.status === 404) {
                  this.router.navigate(['/profile']);
              }
            }
          });
        } else { // Se for modo de criação
          this.adicionarRateioParaTodos(); // Adiciona todos os moradores ao rateio por padrão
          this.isLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toastr.error('Falha ao carregar dados iniciais para o formulário.');
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Cria um FormGroup para um item de rateio individual
  criarFormGroupRateio(moradorId: number, valor: number = 0, status: string = 'EM_ABERTO'): FormGroup {
    return new FormGroup({
      morador: new FormControl({ id: moradorId }, Validators.required), // O front-end envia apenas o ID
      valor: new FormControl(valor, [Validators.required, Validators.min(0)]),
      status: new FormControl(status)
    });
  }

  // Adiciona um item de rateio para cada morador
  adicionarRateioParaTodos(): void {
    this.rateios.clear(); // Limpa rateios existentes
    this.moradores.forEach(morador => {
      this.rateios.push(this.criarFormGroupRateio(morador.id, 0, 'EM_ABERTO'));
    });
  }

  // Remove um item de rateio
  removerRateio(index: number): void {
    this.rateios.removeAt(index);
  }

  // Distribui o valor total igualmente entre os rateios
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

  // Envia o formulário (cria ou atualiza conta)
  submit(): void {
    this.contaForm.markAllAsTouched(); // Marca todos os campos como 'touched' para exibir validações
    if (this.contaForm.invalid) {
      this.toastr.error('Formulário inválido. Verifique todos os campos.');
      return;
    }

    const formValue = this.contaForm.value;
    const somaRateios = formValue.rateios.reduce((acc: number, item: { valor: number; }) => acc + item.valor, 0);

    // Permite uma pequena diferença de arredondamento
    if (Math.abs(somaRateios - formValue.valor) > 0.02) {
      this.toastr.error(`A soma dos rateios (${somaRateios.toFixed(2)}) não bate com o valor total da conta (${formValue.valor.toFixed(2)}).`);
      return;
    }

    // Mapeia os dados do formulário para o ContaDTO que o backend espera
    const contaDto: ContaDTO = {
      observacao: formValue.observacao,
      valor: formValue.valor,
      dataVencimento: new Date(formValue.dataVencimento).toISOString().split('T')[0],
      responsavel: { id: formValue.responsavel }, // Envia apenas o ID do responsável
      tipoConta: { id: formValue.tipoConta },     // Envia apenas o ID do tipo de conta
      rateios: formValue.rateios.map((r: any) => ({ morador: {id: r.morador.id}, valor: r.valor, status: r.status }))
    };

    if (this.contaId) { // Se tiver ID, está em modo de edição
      this.apiService.updateConta(this.contaId, contaDto).subscribe({
        next: () => {
          this.toastr.success('Conta atualizada com sucesso!');
          this.router.navigate(['/profile']); // Redireciona para o dashboard
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erro ao atualizar conta:", err);
          let errorMessage = "Erro ao atualizar conta.";
          if (err && err.error && typeof err.error === 'string') { errorMessage = err.error; }
          else if (err && err.error.message) { errorMessage = err.error.message; }
          this.toastr.error(errorMessage);
        }
      });
    } else { // Se não tiver ID, está em modo de criação
      this.apiService.createConta(contaDto).subscribe({
        next: () => {
          this.toastr.success('Conta cadastrada com sucesso!');
          this.router.navigate(['/profile']); // Redireciona para o dashboard
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erro ao cadastrar conta:", err);
          let errorMessage = "Erro ao cadastrar conta.";
          if (err && err.error && typeof err.error === 'string') { errorMessage = err.error; }
          else if (err && err.error.message) { errorMessage = err.error.message; }
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

  // Helper para obter o nome do morador pelo ID
  getMoradorNome(moradorId: number): string {
    return this.moradores.find(m => m.id === moradorId)?.nome || 'Desconhecido';

  }
  voltarParaPerfil(): void {
  this.router.navigate(['/profile']);
}
}
