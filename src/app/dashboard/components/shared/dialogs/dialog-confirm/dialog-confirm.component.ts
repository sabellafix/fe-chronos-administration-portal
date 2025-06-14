import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-confirm',
  template: `
    <h2 mat-dialog-title class="ff-primary">{{ data.title }}</h2>
    <mat-dialog-content *ngIf="data.description.length > 0" class="pb-2">
      <p>{{ data.description[0] }}</p>
      <p>{{ data.description[1] }}</p>
      <div *ngIf="data.logout" class="w-full mt-2 bg-gray-200 rounded-full h-1.5 mb-2">
        <div class="px-2 bg-success-base h-1.5 rounded-lg" [style.width.%]="progress"></div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" style="margin-right: 10px" class="btn btn-outline-danger btn-sm w-lg waves-effect waves-light">{{ data.labelButtons[1] }}</button>
      <button mat-button (click)="onConfirm()" class="btn btn-outline-primary btn-sm w-lg waves-effect waves-light">{{ data.labelButtons[0] }}</button>

    </mat-dialog-actions>
  `
})
export class DialogConfirmComponent {
  progress: number = 0;
  timer: any;
  
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, description: string[], labelButtons : string[], logout?: boolean }
  ) {
  }

  ngOnInit(): void {
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}