
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
      promptTemplate: "Given the topic '{{topic-definition.output}}' and target audience described as {{audience-analysis.output}}, suggest 3 unique content angles. Competitor research context: {{competitor-research.output}}. Format your response as a JSON object with a single key 'angles', which is an array of 3 strings representing the content angles. Ensure the output is valid JSON.",
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
      promptTemplate: "Generate 5 SEO-friendly page titles for a page about '{{topic-definition.output}}' with the content angle: '{{page-title-generation.userInput.chosenAngle}}'. Format your response as a JSON object with a single key 'titles', which is an array of 5 strings representing the page titles. Ensure the output is valid JSON.",
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

// mockDocuments array has been removed as per user request.

export const getMockWizardInstance = (documentId: string): WizardInstance | undefined => {
  // Since mockDocuments is removed, this function can no longer find any pre-existing mock documents.
  // It's kept for structural purposes if a real data source is connected later,
  // but for now, it will always return undefined for specific document IDs.
  // The logic for creating a NEW instance (`_new_` prefixed IDs) is handled directly in the [pageId]/page.tsx.
  return undefined;
};
