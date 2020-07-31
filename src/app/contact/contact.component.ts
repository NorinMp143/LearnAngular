import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { flyInOut, expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host:{
    '[@flyInOut]' : 'true',
    'style': 'display:block'
  },
  animations:[
    flyInOut(),expand()
  ]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  contactType = ContactType;
  @ViewChild('fform') feedbackFormDirective;
  feedbackcopy: Feedback;
  errMess: string;
  isLoading: boolean;
  isShowingResponse: boolean;

  constructor(private fb: FormBuilder,
    private feedbackService: FeedbackService) { 
    this.createForm();
    this.isLoading = false;
    this.isShowingResponse = false;
  }

  formErrors = {
    'firstname':'','lastname':'','telnum':'','email':''
  };

  validationMessages = {
    'firstname':{
      'required':'First Name is required.',
      'minlength':'First Name must be at least 2 characters long.',
      'maxlength':'First Name cannot be more than 25 characters long.'
    },
    'lastname':{
      'required':'Last Name is required.',
      'minlength':'Last Name must be at least 2 characters long.',
      'maxlength':'Last Name cannot be more than 25 characters long.'
    },
    'telnum':{
      'required':'Tel. number is required.',
      'pattern':'Tel. number must contain only numbers.',
    },
    'email':{
      'required':'Email is required',
      'email':'Email not in valid format.',
    }
  };

  ngOnInit() {
  }

  createForm(){
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe( (data) => this.onValueChanged(data) );

    this.onValueChanged(); // (re)set form validation messages
  }

  onValueChanged(data?: any){
    if(!this.feedbackForm){return;}
    const form = this.feedbackForm;
    for ( const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        //clear previous error messages (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if( control && control.errors && !control.valid){
          const messages = this.validationMessages[field];
          for( const key in control.errors){
            if(control.errors.hasOwnProperty(key)){
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit(){
    this.isLoading = true;
    this.feedback = this.feedbackForm.value;
    this.feedbackService.submitFeedback(this.feedback)
      .subscribe(
        (feedback) => {
          this.feedback = feedback;
          this.feedbackcopy = feedback;
        },
        errmess => {
          this.feedback = null;
          this.feedbackcopy = null;
          this.errMess = <any>errmess
        },
        () => {
          this.isShowingResponse = true;
          setTimeout(() => {
              this.isShowingResponse = false;
              this.isLoading = false;
            } , 5000
          );
        }
        );
    this.feedbackForm.reset({
      firstname:'',
      lastname:'',
      telnum:0,
      email:'',
      agree:false,
      contacttype: 'None',
      message:''
    });

    this.feedbackFormDirective.resetForm();
  }

}