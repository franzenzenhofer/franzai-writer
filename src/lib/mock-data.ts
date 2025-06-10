
import type { Workflow, WizardDocument, WizardInstance, StageState } from "@/types";

export const targetedPageSeoOptimizedV3: Workflow = {
  id: "targeted-page-seo-optimized-v3",
  name: "Targeted Page SEO Optimized V3",
  description: "Create a comprehensive, SEO-optimized page targeting a specific keyword.",
  config: {
    setTitleFromStageOutput: "page-title-generation",
  },
  stages: [
    {
      id: "topic-definition",
      title: "Define Your Topic",
      description: "Clearly state the main topic or keyword for your page.",
      inputType: "textarea",
      outputType: "text",
      dependencies: [],
      autoRun: false,
    },
    {
      id: "audience-analysis",
      title: "Audience Analysis",
      description: "Describe your target audience. Who are you trying to reach?",
      inputType: "form",
      formFields: [
        { name: "demographics", label: "Key Demographics", type: "textarea", placeholder: "e.g., Age, location, profession" },
        { name: "interests", label: "Interests & Pain Points", type: "textarea", placeholder: "e.g., Interested in X, struggles with Y" },
        { name: "knowledgeLevel", label: "Knowledge Level", type: "select", options: [{value: "beginner", label: "Beginner"}, {value: "intermediate", label: "Intermediate"}, {value: "expert", label: "Expert"}] ,defaultValue: "intermediate" },
      ],
      outputType: "json",
      dependencies: ["topic-definition"],
    },
    {
      id: "competitor-research",
      title: "Competitor Research (Optional)",
      description: "List a few competitor pages or URLs for analysis. You can use the Smart Dropzone to upload a text file with URLs, or paste them directly.",
      inputType: "context", // manual + smart dropzone
      outputType: "text",
      dependencies: ["topic-definition"],
      isOptional: true,
    },
    {
      id: "content-angle",
      title: "Content Angle Identification",
      description: "Based on your topic and audience, the AI will suggest unique content angles.",
      inputType: "none", // AI generated
      promptTemplate: "Given the topic '{{topic-definition.output}}' and target audience described as {{audience-analysis.output}}, suggest 3 unique content angles. Competitor research context: {{competitor-research.output}}. Format your response as a JSON object with a single key 'angles', which is an array of 3 strings representing the content angles.",
      model: "gemini-2.0-flash",
      temperature: 0.7,
      outputType: "json", // Expecting { angles: ["angle1", "angle2", "angle3"] }
      dependencies: ["topic-definition", "audience-analysis"],
      autoRun: true,
    },
    {
      id: "page-title-generation",
      title: "Generate Page Title",
      description: "AI will generate compelling page titles based on the chosen angle.",
      inputType: "form", // User selects an angle
      formFields: [
        { name: "chosenAngle", label: "Select Content Angle", type: "select", options: [], placeholder: "Select one of the generated angles" } // Options populated from content-angle output
      ],
      promptTemplate: "Generate 5 SEO-friendly page titles for a page about '{{topic-definition.output}}' with the content angle: '{{page-title-generation.userInput.chosenAngle}}'. Format your response as a JSON object with a single key 'titles', which is an array of 5 strings representing the page titles.",
      model: "gemini-2.0-flash",
      temperature: 0.8,
      outputType: "json", // Expecting { titles: ["title1", ...] }
      dependencies: ["content-angle"],
    },
    {
      id: "outline-creation",
      title: "Create Content Outline",
      description: "Generate a detailed outline for your page.",
      inputType: "form", // User selects a title
       formFields: [
        { name: "chosenTitle", label: "Select Page Title", type: "select", options: [], placeholder: "Select one of the generated titles" } // Options populated from page-title-generation output
      ],
      promptTemplate: "Create a detailed content outline for an article titled '{{outline-creation.userInput.chosenTitle}}' about '{{topic-definition.output}}'. The target audience is {{audience-analysis.output}}.",
      model: "gemini-2.0-flash",
      temperature: 0.6,
      outputType: "markdown",
      dependencies: ["page-title-generation", "audience-analysis"],
    },
    {
      id: "full-draft-generation",
      title: "Generate Full Draft",
      description: "AI will write the full draft based on the outline and title.",
      inputType: "none",
      promptTemplate: "Write a full article draft based on the title '{{outline-creation.userInput.chosenTitle}}' and the following outline: \n{{outline-creation.output}} \n\nTopic: {{topic-definition.output}}\nAudience: {{audience-analysis.output}}.",
      model: "gemini-2.0-flash", // Or a more powerful model for longer content
      temperature: 0.7,
      outputType: "markdown",
      dependencies: ["outline-creation"],
      autoRun: false, // Usually a user-triggered long step
    },
  ],
};

export const mockWorkflows: Workflow[] = [
  targetedPageSeoOptimizedV3,
  {
    id: "simple-blog-post",
    name: "Simple Blog Post",
    description: "Quickly draft a simple blog post on any topic.",
    stages: [
       {
        id: "blog-topic",
        title: "Blog Post Topic",
        description: "What is your blog post about?",
        inputType: "textarea",
        outputType: "text",
        dependencies: [],
      },
      {
        id: "blog-draft",
        title: "Generate Draft",
        description: "AI will write a draft for your blog post.",
        inputType: "none",
        promptTemplate: "Write a blog post about '{{blog-topic.output}}'.",
        model: "gemini-2.0-flash",
        temperature: 0.7,
        outputType: "markdown",
        dependencies: ["blog-topic"],
        autoRun: true,
      },
    ]
  }
];

export const mockDocuments: WizardDocument[] = [
  {
    id: "doc-1",
    title: "My First AI Document",
    workflowId: "targeted-page-seo-optimized-v3",
    status: "in-progress",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    userId: "user-123",
  },
  {
    id: "doc-2",
    title: "Quick Blog Post Idea",
    workflowId: "simple-blog-post",
    status: "draft",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    userId: "user-123",
  },
  {
    id: "doc-3",
    title: "Exploring Advanced SEO",
    workflowId: "targeted-page-seo-optimized-v3",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    userId: "user-123",
  },
];


export const getMockWizardInstance = (documentId: string): WizardInstance | undefined => {
  const doc = mockDocuments.find(d => d.id === documentId);
  if (!doc) return undefined;

  const workflow = mockWorkflows.find(w => w.id === doc.workflowId);
  if (!workflow) return undefined;

  const initialStageStates: Record<string, StageState> = {};
  workflow.stages.forEach(stage => {
    initialStageStates[stage.id] = {
      stageId: stage.id,
      status: "idle",
      userInput: stage.formFields ? Object.fromEntries(stage.formFields.map(f => [f.name, f.defaultValue ?? (f.type === 'checkbox' ? false : '')])) : undefined,
    };
  });
  
  // Example of pre-filled data for doc-1's user inputs, but NOT AI outputs
  if (doc.id === "doc-1") {
    initialStageStates["topic-definition"] = {
      stageId: "topic-definition",
      userInput: "Sustainable Urban Gardening",
      output: "Sustainable Urban Gardening", // This is user input echoed as output for non-AI stage
      status: "completed",
      completedAt: new Date(Date.now() - 200000).toISOString(),
    };
    initialStageStates["audience-analysis"] = {
        stageId: "audience-analysis",
        userInput: { demographics: "Urban dwellers, 25-45, small spaces", interests: "Sustainability, fresh food, home decor", knowledgeLevel: "beginner" },
        output: { demographics: "Urban dwellers, 25-45, small spaces", interests: "Sustainability, fresh food, home decor", knowledgeLevel: "beginner" }, // User input echoed
        status: "completed",
        completedAt: new Date(Date.now() - 100000).toISOString(),
    };
    // content-angle is AI driven, so it starts as 'idle' or 'pending deps'
    // Remove any pre-filled 'output' for AI stages like content-angle
     initialStageStates["content-angle"] = {
        stageId: "content-angle",
        status: "idle", // Will auto-run if dependencies are met
    };
  }


  return {
    document: doc,
    workflow,
    stageStates: initialStageStates,
  };
};

