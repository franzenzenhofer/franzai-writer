
"use client";

import React, { useState, useEffect, useMemo, type ChangeEvent, forwardRef, useImperativeHandle } from "react";
import type { Stage, FormField, StageState, FormFieldOption } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { SmartDropzone } from "./smart-dropzone";
import { TokenCounter } from "./token-counter";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
// Button removed as it's no longer used for explicit save here
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField as ShadFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Save icon removed as button is removed

export interface StageInputAreaProps {
  stage: Stage;
  stageState: StageState;
  onInputChange: (stageId: string, fieldName: string, value: any) => void;
  onFormSubmit: (stageId: string, data: any) => void; 
  allStageStates: Record<string, StageState>;
}

export interface StageInputAreaRef {
  triggerSubmit: () => void;
}

export const StageInputArea = forwardRef<StageInputAreaRef, StageInputAreaProps>(
  ({ stage, stageState, onInputChange, onFormSubmit, allStageStates }, ref) => {
  const [contextManualInput, setContextManualInput] = useState(
    typeof stageState.userInput?.manual === 'string' ? stageState.userInput.manual : ""
  );
  const [contextDroppedInput, setContextDroppedInput] = useState(
     typeof stageState.userInput?.dropped === 'string' ? stageState.userInput.dropped : ""
  );

  const formSchema = useMemo(() => {
    if (stage.inputType !== 'form' || !stage.formFields) return z.object({});
    const shape: Record<string, z.ZodTypeAny> = {};
    stage.formFields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;
      switch (field.type) {
        case 'text':
          fieldSchema = z.string().min(1, `${field.label} is required.`);
          break;
        case 'textarea':
          fieldSchema = z.string().min(1, `${field.label} is required.`);
          break;
        case 'checkbox':
          fieldSchema = z.boolean().default(field.defaultValue as boolean || false);
          break;
        case 'select':
          fieldSchema = z.string().min(1, `${field.label} is required.`);
          break;
        default:
          fieldSchema = z.any();
      }
      if (field.validation?.optional) {
        fieldSchema = fieldSchema.optional();
      }
      if (!field.validation?.required && field.type !== 'checkbox') {
        fieldSchema = fieldSchema.optional().or(z.literal('')); 
      }
      shape[field.name] = fieldSchema;
    });
    return z.object(shape);
  }, [stage.inputType, stage.formFields]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => {
      if (stage.inputType === 'form' && stage.formFields) {
        const defaults: Record<string, any> = {};
        stage.formFields.forEach(field => {
          defaults[field.name] = stageState.userInput?.[field.name] ?? field.defaultValue ?? (field.type === 'checkbox' ? false : '');
        });
        return defaults;
      }
      return {};
    }, [stage.inputType, stage.formFields, stageState.userInput]),
    // Update form values when stageState.userInput changes from parent due to other actions (e.g. reset)
    // This also ensures that direct changes to form fields call onFormSubmit to update the central state.
    // mode: "onChange" or "onBlur" could be used if we want to push updates more frequently.
    // For now, onFormSubmit is called when the StageCard's primary button is clicked.
  });
  
  useEffect(() => {
    if (stage.inputType === 'form' && stage.formFields) {
      const currentValues = stageState.userInput || {};
      const defaultValuesToReset: Record<string, any> = {};
      stage.formFields.forEach(field => {
         defaultValuesToReset[field.name] = currentValues[field.name] ?? field.defaultValue ?? (field.type === 'checkbox' ? false : '');
      });
      form.reset(defaultValuesToReset);
    }
  }, [stageState.userInput, stage.formFields, stage.inputType, form]);

  // This handler is now primarily for onFormSubmit from StageCard
  const RHFSubmitHandler: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    onFormSubmit(stage.id, data); 
  };

  useImperativeHandle(ref, () => ({
    triggerSubmit: () => {
      // This function will be called by StageCard to get the latest form data
      // and call onFormSubmit before running the AI or processing.
      form.handleSubmit(RHFSubmitHandler)();
    }
  }));

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(stage.id, "userInput", e.target.value);
  };

  const handleContextManualChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContextManualInput(newValue);
    onInputChange(stage.id, "userInput", { manual: newValue, dropped: contextDroppedInput });
  };

  const handleContextDroppedText = (text: string) => {
    setContextDroppedInput(text);
    onInputChange(stage.id, "userInput", { manual: contextManualInput, dropped: text });
  };

  const getSelectOptions = (field: FormField): FormFieldOption[] => {
    if (field.options && field.options.length > 0) return field.options;
    const dependencyStageId = stage.dependencies?.find(depId => {
        if (field.name === 'chosenAngle' && depId === 'content-angle') return true;
        if (field.name === 'chosenTitle' && depId === 'page-title-generation') return true;
        return false;
    });

    if (dependencyStageId) {
        const depState = allStageStates[dependencyStageId];
        if (depState?.status === 'completed' && depState.output) {
            if(field.name === 'chosenAngle' && Array.isArray(depState.output.angles)) {
                 return depState.output.angles.map((angle: string) => ({ value: angle, label: angle }));
            }
            if(field.name === 'chosenTitle' && Array.isArray(depState.output.titles)) {
                 return depState.output.titles.map((title: string) => ({ value: title, label: title }));
            }
        }
    }
    return field.options || [];
  };


  switch (stage.inputType) {
    case "textarea":
      return (
        <div className="space-y-2">
          <Textarea
            placeholder={stage.description || "Enter your input here..."}
            value={typeof stageState.userInput === 'string' ? stageState.userInput : ""}
            onChange={handleTextareaChange}
            rows={8}
            className="bg-background"
          />
          <TokenCounter text={typeof stageState.userInput === 'string' ? stageState.userInput : ""} />
        </div>
      );
    case "context":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor={`${stage.id}-manual-input`}>Manual Context Input</Label>
            <Textarea
              id={`${stage.id}-manual-input`}
              placeholder="Paste relevant text or type your context here..."
              value={contextManualInput}
              onChange={handleContextManualChange}
              rows={6}
              className="bg-background"
            />
            <TokenCounter text={contextManualInput} />
          </div>
          <div>
            <Label>Or Upload File Content (Smart Dropzone)</Label>
            <SmartDropzone onTextExtracted={handleContextDroppedText} />
             {contextDroppedInput && (
              <div className="mt-2">
                <Label>Dropped Content Preview (first 200 chars):</Label>
                <p className="text-xs p-2 border rounded bg-muted h-20 overflow-y-auto">
                    {contextDroppedInput.substring(0,200)}{contextDroppedInput.length > 200 ? '...' : ''}
                </p>
                <TokenCounter text={contextDroppedInput} />
              </div>
            )}
          </div>
        </div>
      );
    case "form":
      if (!stage.formFields) return <p>Form fields not configured for this stage.</p>;
      return (
        <Form {...form}>
          <form 
            // The form submission is now triggered by StageCard via ref.triggerSubmit()
            // which calls form.handleSubmit(RHFSubmitHandler)
            className="space-y-6"
            onSubmit={(e) => e.preventDefault()} // Prevent default browser submission
          >
            {stage.formFields.map((field) => (
              <ShadFormField
                key={field.name}
                control={form.control}
                name={field.name as any} 
                render={({ field: controllerField }) => {
                  // When the controller field value changes, we directly call onFormSubmit
                  // to update the central WizardShell state. This makes the "Save Input" button redundant.
                  const onChangeHandler = (value: any) => {
                    controllerField.onChange(value); // Update react-hook-form internal state
                    // Update the central state in WizardShell immediately
                    // This assumes form.getValues() gives the complete, most up-to-date form state.
                    onFormSubmit(stage.id, { ...form.getValues(), [controllerField.name]: value });
                  };

                  const finalValue = controllerField.value ?? field.defaultValue ?? (field.type === 'checkbox' ? false : '');
                  
                  return (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === "textarea" ? (
                        <Textarea 
                          placeholder={field.placeholder} 
                          {...controllerField} 
                          onChange={(e) => onChangeHandler(e.target.value)}
                          value={finalValue as string} 
                          className="bg-background"/>
                      ) : field.type === "checkbox" ? (
                        <div className="flex items-center space-x-2">
                           <Checkbox 
                            checked={finalValue as boolean} 
                            onCheckedChange={(checked) => onChangeHandler(checked)}
                           />
                           <Label htmlFor={field.name} className="text-sm font-normal">{field.placeholder || field.label}</Label>
                        </div>
                      ) : field.type === "select" ? (
                        <Select 
                          onValueChange={(value) => onChangeHandler(value)} 
                          value={finalValue || ""} 
                          defaultValue={field.defaultValue as string || ""}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder={field.placeholder || "Select an option"} />
                          </SelectTrigger>
                          <SelectContent>
                            {getSelectOptions(field).map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          type={field.type} 
                          placeholder={field.placeholder} 
                          {...controllerField} 
                          onChange={(e) => onChangeHandler(e.target.value)}
                          value={finalValue as string} 
                          className="bg-background"/>
                      )}
                    </FormControl>
                    {field.placeholder && field.type !== 'checkbox' && <FormDescription>{/* Add description if needed */}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}}
              />
            ))}
             {/* Removed explicit "Save Input" button. StageCard's primary button handles processing. */}
          </form>
        </Form>
      );
    case "none":
      return <p className="text-sm text-muted-foreground">This stage is processed automatically by AI. No input required here.</p>;
    default:
      return <p>Unknown input type: {stage.inputType}</p>;
  }
});

StageInputArea.displayName = "StageInputArea";
