Fetched content from https://ai.google.dev/gemini-api/docs/image-generation on 2025-06-17 07:48:42

Skip to main content
More
/
Gemini API docs
API Reference
Cookbook
Community
Get started
Overview
Quickstart
API keys
Libraries
OpenAI compatibility
Models
All models
Pricing
Rate limits
Billing info
Model Capabilities
Text generation
Image generation
Video generation
Speech generation
Music generation
Long context
Structured output
Thinking
Function calling
Document understanding
Image understanding
Video understanding
Audio understanding
Code execution
URL context
Grounding with Google Search
Guides
Prompt engineering
Live API
Context caching
Files API
Token counting
Fine-tuning
Embeddings
Safety
Resources
Migrate to Gen AI SDK
Release notes
API troubleshooting
Open-Source Frameworks
AI Studio
Google Cloud Platform
Policies
Terms of service
Available regions
Additional usage polices
Home
Gemini API
Models
Was this helpful?
Send feedback
Image generation
On this page
Before you begin
Generate images using Gemini
Image generation (text-to-image)
Image editing (text-and-image-to-image)
Other image generation modes
Limitations
Generate images using Imagen 3
Imagen model parameters

You can generate images using the Gemini API with either Gemini's built-in multimodal capabilities or Imagen, Google's specialized image generation model. For most use cases, start with Gemini. Choose Imagen for specialized tasks where image quality is critical. See Choosing the right model section for more guidance.

All generated images include a SynthID watermark.

Before you begin

Ensure you use a supported model and version for image generation:

For Gemini, use Gemini 2.0 Flash Preview Image Generation.

For Imagen, use Imagen 3. Note that this model is only available on the Paid tier.

You can access both Gemini and Imagen 3 using the same libraries.

Note: Image generation may not be available in all regions and countries, review our Models page for more information.
Generate images using Gemini

Gemini can generate and process images conversationally. You can prompt Gemini with text, images, or a combination of both to achieve various image-related tasks, such as image generation and editing.

You must include responseModalities: ["TEXT", "IMAGE"] in your configuration. Image-only output is not supported with these models.

Image generation (text-to-image)

The following code demonstrates how to generate an image based on a descriptive prompt:

Python
JavaScript
Go
REST
Note: We've released the Google SDK for TypeScript and JavaScript in preview launch stage. Use this SDK for image generation features.
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

  const contents =
    "Hi, can you create a 3d rendered image of a pig " +
    "with wings and a top hat flying over a happy " +
    "futuristic scifi city with lots of greenery?";

  // Set responseModalities to include "Image" so the model can generate  an image
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });
  for (const part of response.candidates[0].content.parts) {
    // Based on the part type, either show the text or save the image
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

main();

AI-generated image of a fantastical flying pig
Image editing (text-and-image-to-image)

To perform image editing, add an image as input. The following example demonstrates uploading base64 encoded images. For multiple images and larger payloads, check the image input section.

Python
JavaScript
Go
REST
Note: We've released the Google SDK for TypeScript and JavaScript in preview launch stage. Use this SDK for image generation features.
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

  // Load the image from the local file system
  const imagePath = "path/to/image.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  // Prepare the content parts
  const contents = [
    { text: "Can you add a llama next to the image?" },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  // Set responseModalities to include "Image" so the model can generate an image
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });
  for (const part of response.candidates[0].content.parts) {
    // Based on the part type, either show the text or save the image
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

main();

Other image generation modes

Gemini supports other image interaction modes based on prompt structure and context, including:

Text to image(s) and text (interleaved): Outputs images with related text.
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved): Uses input images and text to create new related images and text.
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Multi-turn image editing (chat): Keep generating / editing images conversationally.
Example prompts: [upload an image of a blue car.] , "Turn this car into a convertible.", "Now change the color to yellow."
Limitations
For best performance, use the following languages: EN, es-MX, ja-JP, zh-CN, hi-IN.
Image generation does not support audio or video inputs.
Image generation may not always trigger:
The model may output text only. Try asking for image outputs explicitly (e.g. "generate an image", "provide images as you go along", "update the image").
The model may stop generating partway through. Try again or try a different prompt.
When generating text for an image, Gemini works best if you first generate the text and then ask for an image with the text.
There are some regions/countries where Image generation is not available. See Models for more information.
Generate images using Imagen 3

This example demonstrates generating images with Imagen 3:

Python
JavaScript
Go
REST
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: 'Robot holding a red skateboard',
    config: {
      numberOfImages: 4,
    },
  });

  let idx = 1;
  for (const generatedImage of response.generatedImages) {
    let imgBytes = generatedImage.image.imageBytes;
    const buffer = Buffer.from(imgBytes, "base64");
    fs.writeFileSync(`imagen-${idx}.png`, buffer);
    idx++;
  }
}

main();

AI-generated image of a robot holding a red skateboard
Imagen model parameters

Imagen supports English only prompts at this time and the following parameters:

Note: Naming conventions of parameters vary by programming language.
numberOfImages: The number of images to generate, from 1 to 4 (inclusive). The default is 4.
aspectRatio: Changes the aspect ratio of the generated image. Supported values are "1:1", "3:4", "4:3", "9:16", and "16:9". The default is "1:1".

personGeneration: Allow the model to generate images of people. The following values are supported:

"dont_allow": Block generation of images of people.
"allow_adult": Generate images of adults, but not children. This is the default.
"allow_all": Generate images that include adults and children.
Note: The "allow_all" parameter value is not allowed in EU, UK, CH, MENA locations.
Choosing the right model

Choose Gemini when:

You need contextually relevant images that leverage world knowledge and reasoning.
Seamlessly blending text and images is important.
You want accurate visuals embedded within long text sequences.
You want to edit images conversationally while maintaining context.

Choose Imagen 3 when:

Image quality, photorealism, artistic detail, or specific styles (e.g., impressionism, anime) are top priorities.
Performing specialized editing tasks like product background updates or image upscaling.
Infusing branding, style, or generating logos and product designs.
Imagen prompt guide

This section of the Imagen guide shows you how modifying a text-to-image prompt can produce different results, along with examples of images you can create.

Prompt writing basics
Note: Maximum prompt length is 480 tokens.

A good prompt is descriptive and clear, and makes use of meaningful keywords and modifiers. Start by thinking of your subject, context, and style.

Image text: A sketch (style) of a modern apartment building (subject) surrounded by skyscrapers (context and background).

Subject: The first thing to think about with any prompt is the subject: the object, person, animal, or scenery you want an image of.

Context and background: Just as important is the background or context in which the subject will be placed. Try placing your subject in a variety of backgrounds. For example, a studio with a white background, outdoors, or indoor environments.

Style: Finally, add the style of image you want. Styles can be general (painting, photograph, sketches) or very specific (pastel painting, charcoal drawing, isometric 3D). You can also combine styles.

After you write a first version of your prompt, refine your prompt by adding more details until you get to the image that you want. Iteration is important. Start by establishing your core idea, and then refine and expand upon that core idea until the generated image is close to your vision.

Prompt: A park in the spring next to a lake
	
Prompt: A park in the spring next to a lake, the sun sets across the lake, golden hour
	
Prompt: A park in the spring next to a lake, the sun sets across the lake, golden hour, red wildflowers

Imagen 3 can transform your ideas into detailed images, whether your prompts are short or long and detailed. Refine your vision through iterative prompting, adding details until you achieve the perfect result.

Short prompts let you generate an image quickly.

Prompt: close-up photo of a woman in her 20s, street photography, movie still, muted orange warm tones
	

Longer prompts let you add specific details and build your image.

Prompt: captivating photo of a woman in her 20s utilizing a street photography style. The image should look like a movie still with muted orange warm tones.

Additional advice for Imagen prompt writing:

Use descriptive language: Employ detailed adjectives and adverbs to paint a clear picture for Imagen 3.
Provide context: If necessary, include background information to aid the AI's understanding.
Reference specific artists or styles: If you have a particular aesthetic in mind, referencing specific artists or art movements can be helpful.
Use prompt engineering tools: Consider exploring prompt engineering tools or resources to help you refine your prompts and achieve optimal results.
Enhancing the facial details in your personal and group images: Specify facial details as a focus of the photo (for example, use the word "portrait" in the prompt).
Generate text in images

Imagen can add text into images, opening up more creative image generation possibilities. Use the following guidance to get the most out of this feature:

Iterate with confidence: You might have to regenerate images until you achieve the look you want. Imagen's text integration is still evolving, and sometimes multiple attempts yield the best results.
Keep it short: Limit text to 25 characters or less for optimal generation.

Multiple phrases: Experiment with two or three distinct phrases to provide additional information. Avoid exceeding three phrases for cleaner compositions.

Prompt: A poster with the text "Summerland" in bold font as a title, underneath this text is the slogan "Summer never felt so good"

Guide Placement: While Imagen can attempt to position text as directed, expect occasional variations. This feature is continually improving.

Inspire font style: Specify a general font style to subtly influence Imagen's choices. Don't rely on precise font replication, but expect creative interpretations.

Font size: Specify a font size or a general indication of size (for example, small, medium, large) to influence the font size generation.

Prompt parameterization

To better control output results, you might find it helpful to parameterize the inputs into Imagen. For example, suppose you want your customers to be able to generate logos for their business, and you want to make sure logos are always generated on a solid color background. You also want to limit the options that the client can select from a menu.

In this example, you can create a parameterized prompt similar to the following:

A {logo_style} logo for a {company_area} company on a solid color background. Include the text {company_name}.

In your custom user interface, the customer can input the parameters using a menu, and their chosen value populates the prompt Imagen receives.

For example:

Prompt: A minimalist logo for a health care company on a solid color background. Include the text Journey.

Prompt: A modern logo for a software company on a solid color background. Include the text Silo.

Prompt: A traditional logo for a baking company on a solid color background. Include the text Seed.

Advanced prompt writing techniques

Use the following examples to create more specific prompts based on attributes like photography descriptors, shapes and materials, historical art movements, and image quality modifiers.

Photography
Prompt includes: "A photo of..."

To use this style, start with using keywords that clearly tell Imagen that you're looking for a photograph. Start your prompts with "A photo of. . .". For example:

Prompt: A photo of coffee beans in a kitchen on a wooden surface
	
Prompt: A photo of a chocolate bar on a kitchen counter
	
Prompt: A photo of a modern building with water in the background

Image source: Each image was generated using its corresponding text prompt with the Imagen 3 model.

Photography modifiers

In the following examples, you can see several photography-specific modifiers and parameters. You can combine multiple modifiers for more precise control.

Camera Proximity - Close up, taken from far away

Prompt: A close-up photo of coffee beans
	
Prompt: A zoomed out photo of a small bag of
coffee beans in a messy kitchen

Camera Position - aerial, from below

Prompt: aerial photo of urban city with skyscrapers
	
Prompt: A photo of a forest canopy with blue skies from below

Lighting - natural, dramatic, warm, cold

Prompt: studio photo of a modern arm chair, natural lighting
	
Prompt: studio photo of a modern arm chair, dramatic lighting

Camera Settings - motion blur, soft focus, bokeh, portrait

Prompt: photo of a city with skyscrapers from the inside of a car with motion blur
	
Prompt: soft focus photograph of a bridge in an urban city at night

Lens types - 35mm, 50mm, fisheye, wide angle, macro

Prompt: photo of a leaf, macro lens
	
Prompt: street photography, new york city, fisheye lens

Film types - black and white, polaroid

Prompt: a polaroid portrait of a dog wearing sunglasses
	
Prompt: black and white photo of a dog wearing sunglasses

Image source: Each image was generated using its corresponding text prompt with the Imagen 3 model.

Illustration and art
Prompt includes: "A painting of...", "A sketch of..."

Art styles vary from monochrome styles like pencil sketches, to hyper-realistic digital art. For example, the following images use the same prompt with different styles:

"An [art style or creation technique] of an angular sporty electric sedan with skyscrapers in the background"

Prompt: A technical pencil drawing of an angular...
	
Prompt: A charcoal drawing of an angular...
	
Prompt: A color pencil drawing of an angular...
Prompt: A pastel painting of an angular...
	
Prompt: A digital art of an angular...
	
Prompt: An art deco (poster) of an angular...

Image source: Each image was generated using its corresponding text prompt with the Imagen 2 model.

Shapes and materials
Prompt includes: "...made of...", "...in the shape of..."

One of the strengths of this technology is that you can create imagery that is otherwise difficult or impossible. For example, you can recreate your company logo in different materials and textures.

Prompt: a duffle bag made of cheese
	
Prompt: neon tubes in the shape of a bird
	
Prompt: an armchair made of paper, studio photo, origami style

Image source: Each image was generated using its corresponding text prompt with the Imagen 3 model.

Historical art references
Prompt includes: "...in the style of..."

Certain styles have become iconic over the years. The following are some ideas of historical painting or art styles that you can try.

"generate an image in the style of [art period or movement] : a wind farm"

Prompt: generate an image in the style of an impressionist painting: a wind farm
	
Prompt: generate an image in the style of a renaissance painting: a wind farm
	
Prompt: generate an image in the style of pop art: a wind farm

Image source: Each image was generated using its corresponding text prompt with the Imagen 3 model.

Image quality modifiers

Certain keywords can let the model know that you're looking for a high-quality asset. Examples of quality modifiers include the following:

General Modifiers - high-quality, beautiful, stylized
Photos - 4K, HDR, Studio Photo
Art, Illustration - by a professional, detailed

The following are a few examples of prompts without quality modifiers and the same prompt with quality modifiers.

Prompt (no quality modifiers): a photo of a corn stalk
	
Prompt (with quality modifiers): 4k HDR beautiful
photo of a corn stalk taken by a
professional photographer

Image source: Each image was generated using its corresponding text prompt with the Imagen 3 model.

Aspect ratios

Imagen 3 image generation lets you set five distinct image aspect ratios.

Square (1:1, default) - A standard square photo. Common uses for this aspect ratio include social media posts.

Fullscreen (4:3) - This aspect ratio is commonly used in media or film. It is also the dimensions of most old (non-widescreen) TVs and medium format cameras. It captures more of the scene horizontally (compared to 1:1), making it a preferred aspect ratio for photography.

Prompt: close up of a musician's fingers playing the piano, black and white film, vintage (4:3 aspect ratio)
	
Prompt: A professional studio photo of french fries for a high end restaurant, in the style of a food magazine (4:3 aspect ratio)

Portrait full screen (3:4) - This is the fullscreen aspect ratio rotated 90 degrees. This lets to capture more of the scene vertically compared to the 1:1 aspect ratio.

Prompt: a woman hiking, close of her boots reflected in a puddle, large mountains in the background, in the style of an advertisement, dramatic angles (3:4 aspect ratio)
	
Prompt: aerial shot of a river flowing up a mystical valley (3:4 aspect ratio)

Widescreen (16:9) - This ratio has replaced 4:3 and is now the most common aspect ratio for TVs, monitors, and mobile phone screens (landscape). Use this aspect ratio when you want to capture more of the background (for example, scenic landscapes).

Prompt: a man wearing all white clothing sitting on the beach, close up, golden hour lighting (16:9 aspect ratio)

Portrait (9:16) - This ratio is widescreen but rotated. This a relatively new aspect ratio that has been popularized by short form video apps (for example, YouTube shorts). Use this for tall objects with strong vertical orientations such as buildings, trees, waterfalls, or other similar objects.

Prompt: a digital render of a massive skyscraper, modern, grand, epic with a beautiful sunset in the background (9:16 aspect ratio)
Photorealistic images

Different versions of the image generation model might offer a mix of artistic and photorealistic output. Use the following wording in prompts to generate more photorealistic output, based on the subject you want to generate.

Note: Take these keywords as general guidance when you try to create photorealistic images. They aren't required to achieve your goal.
Use case	Lens type	Focal lengths	Additional details
People (portraits)	Prime, zoom	24-35mm	black and white film, Film noir, Depth of field, duotone (mention two colors)
Food, insects, plants (objects, still life)	Macro	60-105mm	High detail, precise focusing, controlled lighting
Sports, wildlife (motion)	Telephoto zoom	100-400mm	Fast shutter speed, Action or movement tracking
Astronomical, landscape (wide-angle)	Wide-angle	10-24mm	Long exposure times, sharp focus, long exposure, smooth water or clouds
Portraits
Use case	Lens type	Focal lengths	Additional details
People (portraits)	Prime, zoom	24-35mm	black and white film, Film noir, Depth of field, duotone (mention two colors)

Using several keywords from the table, Imagen can generate the following portraits:

			

Prompt: A woman, 35mm portrait, blue and grey duotones
Model: imagen-3.0-generate-002

			

Prompt: A woman, 35mm portrait, film noir
Model: imagen-3.0-generate-002

Objects
Use case	Lens type	Focal lengths	Additional details
Food, insects, plants (objects, still life)	Macro	60-105mm	High detail, precise focusing, controlled lighting

Using several keywords from the table, Imagen can generate the following object images:

			

Prompt: leaf of a prayer plant, macro lens, 60mm
Model: imagen-3.0-generate-002

			

Prompt: a plate of pasta, 100mm Macro lens
Model: imagen-3.0-generate-002

Motion
Use case	Lens type	Focal lengths	Additional details
Sports, wildlife (motion)	Telephoto zoom	100-400mm	Fast shutter speed, Action or movement tracking

Using several keywords from the table, Imagen can generate the following motion images:

			

Prompt: a winning touchdown, fast shutter speed, movement tracking
Model: imagen-3.0-generate-002

			

Prompt: A deer running in the forest, fast shutter speed, movement tracking
Model: imagen-3.0-generate-002

Wide-angle
Use case	Lens type	Focal lengths	Additional details
Astronomical, landscape (wide-angle)	Wide-angle	10-24mm	Long exposure times, sharp focus, long exposure, smooth water or clouds

Using several keywords from the table, Imagen can generate the following wide-angle images:

			

Prompt: an expansive mountain range, landscape wide angle 10mm
Model: imagen-3.0-generate-002

			

Prompt: a photo of the moon, astro photography, wide angle 10mm
Model: imagen-3.0-generate-002

What's next
Check out the Veo guide to learn how to generate videos with the Gemini API.
To learn more about Gemini 2.0 models, see Gemini models and Experimental models.
Was this helpful?
Send feedback

Except as otherwise noted, the content of this page is licensed under the Creative Commons Attribution 4.0 License, and code samples are licensed under the Apache 2.0 License. For details, see the Google Developers Site Policies. Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-05-27 UTC.

Terms
Privacy
The new page has loaded.

End of content from https://ai.google.dev/gemini-api/docs/image-generation
----

Okay, here's a concept, specification, and UX design for the image creation module, ensuring it's configurable via `workflow.json` and supports both Gemini and Imagen models.  ## 1. Overall Concept & UX Flow  The image creation process will be a two-stage system within your existing workflow structure:  *   **Stage 1: Image Prompt & Configuration (Input Module)**     *   Users define the core visual idea and select basic parameters like aspect ratio.     *   This stage gathers user-specific input for the image. *   **Stage 2: Image Generation & Refinement (Image Creation Module)**     *   This AI-powered stage takes the "briefing" from Stage 1, combines it with its own configurable prompt settings, and generates the image using either Gemini or Imagen.     *   After generation, it allows for "redo" or refinement operations.  **User Experience Flow:**  1.  User reaches the "Image Prompt & Configuration" stage. 2.  Fills out a form with their desired image description (the "prompt") and selects an aspect ratio. 3.  Clicks "Continue" (or similar action button). 4.  The "Image Generation & Refinement" stage becomes active.     *   If `autoRun` is true (and dependencies are met), image generation starts automatically.     *   Otherwise, a "Generate Image" button is presented along with a summary of the compiled prompt/briefing. 5.  During generation, a loading/progress indicator is shown. 6.  Once generated, the image(s) are displayed. 7.  Options for "Redo/Refine" are available, allowing the user to provide further instructions to modify the image or regenerate it. 8.  The final selected image (or its data/URL) becomes the output of this stage, usable by subsequent workflow stages.  ## 2. Workflow.json Specification  Here's how these two stages would be defined in your `workflow.json`:  ```json {   "id": "example-image-workflow",   "name": "Example Workflow with Image Generation",   "stages": [     // ... other stages ...     {       "id": "image-prompt-input",       "title": "Describe Your Image",       "description": "Provide a detailed prompt for the image you want to create and select an aspect ratio.",       "inputType": "form",       "outputType": "json", // Output will be { userPrompt: "...", aspectRatio: "..." }       "formFields": [         {           "name": "userPrompt",           "label": "Image Prompt",           "type": "textarea",           "placeholder": "e.g., A futuristic cityscape at sunset with flying cars, detailed, photorealistic",           "validation": { "required": true, "minLength": 10 }         },         {           "name": "aspectRatio",           "label": "Aspect Ratio",           "type": "select",           "defaultValue": "1:1",           "options": [             { "value": "1:1", "label": "Square (1:1)" },             { "value": "16:9", "label": "Widescreen (16:9)" },             { "value": "9:16", "label": "Portrait (9:16)" },             { "value": "4:3", "label": "Landscape (4:3)" },             { "value": "3:4", "label": "Portrait (3:4)" },             { "value": "model_default", "label": "Model Default / Auto" }           ]         }       ],       "dependencies": [] // Or depends on previous text stages     },     {       "id": "image-generation-execution",       "title": "Generate Image",       "description": "AI will now generate the image based on your briefing.",       "inputType": "none", // Takes input from 'image-prompt-input' via contextVars       "outputType": "image", // A new conceptual output type for handling image data       "dependencies": ["image-prompt-input"],       "autoRun": false, // Or true, if preferred       "model": "gemini-2.0-flash-preview-image-generation", // Default, can be overridden       "promptTemplate": "Create an image based on the user's request: \"{{image-prompt-input.output.userPrompt}}\". \n\nInternal style guidance: {{config.imageGenerationSettings.styleGuidanceInternal}}\nEnsure the image adheres to the aspect ratio: {{image-prompt-input.output.aspectRatio}}.",       "aiRedoEnabled": true,       "imageGenerationSettings": { // New configuration block for image stages         "provider": "gemini", // "gemini" or "imagen"         "styleGuidanceInternal": "Maintain a slightly cinematic and dramatic lighting style.", // Internal prompt part         // Gemini-specific (used if provider is 'gemini')         "gemini": {           "responseModalities": ["TEXT", "IMAGE"] // Must include IMAGE         },         // Imagen-specific (used if provider is 'imagen')         "imagen": {           "numberOfImages": 1, // 1-4, default for Imagen 3 is 4           "personGeneration": "allow_adult" // "dont_allow", "allow_adult", "allow_all"         },         "storeInFirebase": false, // If true, AI action would upload to Firebase Storage and return URL         "negativePrompt": "ugly, blurry, disfigured, watermark, text"       }     }     // ... other stages that might use the generated image ...   ] } ```  **Explanation of New/Key `workflow.json` Fields:**  *   **`image-prompt-input` stage:**     *   Standard `form` inputType. Its `output` will be structured JSON, e.g., `{ "userPrompt": "A cat...", "aspectRatio": "16:9" }`. *   **`image-generation-execution` stage:**     *   `outputType: "image"`: Signifies that this stage produces image data. The actual output in `stageState.output` might be an object like `{ type: 'image/png', dataUrl: 'data:image/png;base64,...', source: 'gemini', promptUsed: '...' }` or an array of such objects.     *   `promptTemplate`: Combines the user's prompt (from `image-prompt-input.output.userPrompt`) with internal directions.     *   `imageGenerationSettings`: A new dedicated block for image-specific configurations.         *   `provider`: "gemini" or "imagen". The AI action will use this to determine which API to call.         *   `styleGuidanceInternal`: An example of how this stage can have its own prompt components.         *   `gemini` / `imagen`: Provider-specific parameters, mirroring their API requirements.         *   `storeInFirebase`: (Conceptual) If true, the backend would handle storing the image and returning a URL.         *   `negativePrompt`: Common parameter for image generation.  ## 3. UI Component UX Details  ### Input Module (`StageCard` for `image-prompt-input`):  *   **Layout**: Standard `StageInputArea` for form types.     *   **Image Prompt**: A `Textarea` (e.g., 6-8 rows) with placeholder text. `TokenCounter` can be used.     *   **Aspect Ratio**: A `Select` dropdown with the predefined options. *   **Action**: "Continue" button.  ### Image Creation Module (`StageCard` for `image-generation-execution`):  *   **Input Area (`StageInputArea` with `inputType: "none"`)**:     *   Displays a summary of the compiled briefing if `autoRun` is `false`. E.g., "Ready to generate an image based on: '[user prompt snippet]' with aspect ratio [selected ratio] and internal style guidance."     *   If `autoRun` is `false`, shows a "Generate Image" button.     *   If `autoRun` is `true` and dependencies are met, it might show "Generating image automatically..." *   **Output Area (`StageOutputArea` handling `outputType: "image"`)**:     *   **Loading State (`stageState.status === "running"`)**:         *   A `DynamicProgressBar` or a `Loader2` spinner.         *   Text: "AI is crafting your image..."     *   **Completed State (`stageState.status === "completed"`)**:         *   **Image Display**:             *   Renders the generated image(s) using `<img>` tags (source could be a data URL or a direct URL if `storeInFirebase` was true).             *   If `numberOfImages > 1` (for Imagen), display as a small scrollable gallery or thumbnails.             *   Include a download button for each image.         *   **Text Output (from Gemini)**: Gemini's image generation also returns text. This should be displayed (e.g., "Here's the image you requested:").         *   **Redo/Refinement Section (`aiRedoEnabled: true`)**:             *   A compact `AiRedoSection` component, but tailored for image refinement.             *   **Refinement Prompt**: A `Textarea` (1-2 rows): "What would you like to change or add?"             *   **Regeneration Options (Conceptual - could be buttons/checkboxes):**                 *   `[Button] Regenerate with new instructions` (uses text-and-image-to-image if supported by model)                 *   `[Button] Try again with same prompt`                 *   `[Select] Vary Style: [Artistic, Photorealistic, Sketch, etc.]` (would modify the prompt)             *   If the initial generation was by Gemini, the refinement can use its image editing capability, sending the original image + text prompt.     *   **Error State (`stageState.status === "error"`)**:         *   Standard error display with `stageState.error` message.  ## 4. Dummy Code Concepts (TypeScript)  ### Type Updates (`src/types/index.ts` additions/modifications):  ```typescript // In StageInputType export type StageInputType = /* existing types */ | "image"; // "image" inputType might not be needed if image upload is part of a form or context stage. Let's assume user provides image prompt as text, and image *upload* for editing is part of the redo flow.                                                               // For initial generation, prompt is text. For redo, prompt is text + previous image.                                                               // So, keep StageInputType as is for now, and handle image data within the Redo flow.  // In Stage outputType export type StageOutputType = /* existing types */ | "image_output"; // Use a distinct name to avoid conflict if "image" means input  // In Stage interface export interface Stage {   // ... existing fields ...   imageGenerationSettings?: ImageGenerationSettings; }  export interface ImageGenerationSettings {   provider: "gemini" | "imagen";   styleGuidanceInternal?: string;   gemini?: GeminiImageConfig;   imagen?: ImagenImageConfig;   storeInFirebase?: boolean;   negativePrompt?: string; }  export interface GeminiImageConfig {   responseModalities?: ("TEXT" | "IMAGE")[]; // Ensure Modality.IMAGE is present   // Add other Gemini-specific parameters from their API if needed }  export interface ImagenImageConfig {   numberOfImages?: number; // 1-4   aspectRatio?: string; // Overridden by user input if available   personGeneration?: "dont_allow" | "allow_adult" | "allow_all";   // Add other Imagen-specific parameters }  // Structure for stageState.output when outputType is "image_output" export interface ImageOutputData {   provider: "gemini" | "imagen";   images: Array<{     dataUrl?: string; // base64 data URL     storageUrl?: string; // Firebase storage URL     promptUsed: string;     seed?: string; // If provided by API     mimeType: string; // e.g., "image/png"   }>;   accompanyingText?: string; // For Gemini's text part } ```  ### AI Action Logic Sketch (`src/app/actions/aiActions-new.ts` - inside `runAiStage`)  ```typescript // ... existing imports and setup ... import { GoogleGenAI, Modality } from '@google/genai'; // Assuming you're using this SDK  // ... inside runAiStage or a dedicated image generation flow ...  if (params.stage?.outputType === "image_output") {   logToAiLog('🖼️ [Image Gen Action] Starting image generation', { stageId: params.stage.id });   const imageSettings = params.stage.imageGenerationSettings;   const imageInputStageState = params.contextVars['image-prompt-input'] as StageState; // Or however the input stage is named    if (!imageSettings || !imageInputStageState || !imageInputStageState.output) {     return { content: null, error: "Image generation settings or input prompt stage output is missing." };   }    const userPrompt = imageInputStageState.output.userPrompt;   const aspectRatio = imageInputStageState.output.aspectRatio === "model_default"                        ? undefined                        : imageInputStageState.output.aspectRatio;    // Construct the final prompt using params.promptTemplate and contextVars   const filledPrompt = substitutePromptVars(params.promptTemplate, {     ...params.contextVars,     'image-prompt-input': imageInputStageState, // Ensure the input stage is available directly     'config': { imageGenerationSettings: imageSettings } // Make stage's own config available   });      // If AI Redo notes are present and an original image is being edited:   let originalImageInputPart = null;   if (params.aiRedoNotes && params.currentStageInput?.originalImage?.dataUrl) {       const originalImageData = params.currentStageInput.originalImage.dataUrl.split(",")[1];       const originalImageMime = params.currentStageInput.originalImage.mimeType;       originalImageInputPart = { inlineData: { mimeType: originalImageMime, data: originalImageData } };   }    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });    try {     let resultOutput: ImageOutputData;      if (imageSettings.provider === "gemini") {       const model = genAI.getGenerativeModel({ model: params.model || "gemini-2.0-flash-preview-image-generation" });              const contentsForGemini: any[] = [];       if (originalImageInputPart) { // For image editing (redo)         contentsForGemini.push(originalImageInputPart);         contentsForGemini.push({ text: `${filledPrompt}\nRefinement: ${params.aiRedoNotes || ''}` });       } else { // For initial generation         contentsForGemini.push({ text: filledPrompt });       }        const geminiResult = await model.generateContent({         contents: contentsForGemini,         generationConfig: {           // candidateCount: 1, // Example, configure as needed           // temperature: params.temperature, // From stage config         },         // IMPORTANT: For Gemini Image Gen, responseModalities is part of the main config, not generationConfig         // This needs to be handled if using a generic model that also supports image gen.         // The example uses a dedicated image gen model which implies IMAGE modality.         // If using gemini-2.0-flash (generic) for images, this would be:         // config: { responseModalities: imageSettings.gemini?.responseModalities || [Modality.TEXT, Modality.IMAGE] }       });              const response = await geminiResult.response;       const textPart = response.text();       const imagesGenerated: ImageOutputData['images'] = [];        response.candidates?.[0]?.content?.parts?.forEach(part => {         if (part.inlineData) {           imagesGenerated.push({             dataUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,             mimeType: part.inlineData.mimeType,             promptUsed: filledPrompt,           });         }       });              resultOutput = {         provider: "gemini",         images: imagesGenerated,         accompanyingText: textPart,       };      } else if (imageSettings.provider === "imagen") {       const imagenModelIdentifier = params.model || "imagen-3.0-generate-002"; // Default to Imagen 3       // Imagen specific API call - conceptual as @google/genai SDK might abstract this       // The browsed content shows `ai.models.generateImages` for Imagen       const imagenResponse = await genAI.models.generateImages({ // Fictional method based on browsed Gemini docs for Imagen           model: imagenModelIdentifier,           prompt: filledPrompt, // Imagen usually takes a simpler text prompt           config: {               numberOfImages: imageSettings.imagen?.numberOfImages || 1,               aspectRatio: aspectRatio, // Pass the user-selected or fixed aspect ratio               personGeneration: imageSettings.imagen?.personGeneration || "allow_adult",               // negativePrompt: imageSettings.negativePrompt // If Imagen API supports it           }       });        const imagesGenerated: ImageOutputData['images'] = imagenResponse.generatedImages.map((img: any) => ({         dataUrl: `data:${img.image.mimeType || 'image/png'};base64,${img.image.imageBytes}`, // Assuming imageBytes is base64         mimeType: img.image.mimeType || 'image/png',         promptUsed: filledPrompt,         seed: img.image.seed // Imagen provides seed       }));        resultOutput = {         provider: "imagen",         images: imagesGenerated,       };     } else {       return { content: null, error: `Unsupported image provider: ${imageSettings.provider}` };     }      // Conceptual: Firebase Storage Upload     if (imageSettings.storeInFirebase) {       // For each image in resultOutput.images:       // 1. Convert dataUrl to Blob/Buffer       // 2. Upload to Firebase Storage (requires server-side Firebase Admin SDK or client-side with rules)       // 3. Replace dataUrl with storageUrl       logToAiLog('🖼️ [Image Gen Action] Firebase storage upload requested (conceptual)', {});     }          logToAiLog('🖼️ [Image Gen Action] Image generation successful', { provider: imageSettings.provider, count: resultOutput.images.length });     return { content: resultOutput, error: undefined };    } catch (e: any) {     logToAiLog('🖼️ [Image Gen Action] Error generating image', { error: e.message });     return { content: null, error: `Image generation failed: ${e.message}` };   } } ```  **Note on Redo Functionality for Images:** When the user uses the "Redo/Refine" feature: 1.  The `StageCard` for image generation will call `onRunStage` again. 2.  It will pass the original `stageState.userInput` (which contains the initial prompt data) *and* the new `aiRedoNotes` from the refinement textarea. 3.  Crucially, it also needs to pass a reference to the *currently displayed image* if the redo is an edit. This could be `params.currentStageInput.originalImage = { dataUrl: '...', mimeType: '...' }`. 4.  The `runAiStage` action then checks for `aiRedoNotes` and `originalImage`.     *   If `originalImage` is present and the model is Gemini, it constructs a multimodal prompt (image + text) for editing.     *   If only `aiRedoNotes` are present (or no original image), it appends the notes to the `filledPrompt` for a new generation.  ## 5. Configuration via `workflow.json` Summary  *   **Dedicated Input Stage**: To gather `userPrompt` and `aspectRatio`. *   **Image Generation Stage**:     *   `outputType: "image_output"`     *   `promptTemplate`: Combines inputs for the AI.     *   `imageGenerationSettings`:         *   `provider`: "gemini" or "imagen".         *   `gemini`/`imagen` sub-objects for provider-specific API parameters (e.g., `numberOfImages` for Imagen, `responseModalities` for Gemini).         *   `negativePrompt`, `styleGuidanceInternal`, etc. for finer control.         *   `aiRedoEnabled: true` to enable the refinement UI.  This structure provides a flexible and powerful way to integrate image generation into various workflows, fully configurable via JSON. The UX aims for a natural flow from text input to image output and refinement.

----


Fetched content from https://ai.google.dev/gemini-api/docs/models on 2025-06-17 08:03:37

Skip to main content
More
/
Gemini API docs
API Reference
Cookbook
Community
Get started
Overview
Quickstart
API keys
Libraries
OpenAI compatibility
Models
All models
Pricing
Rate limits
Billing info
Model Capabilities
Text generation
Image generation
Video generation
Speech generation
Music generation
Long context
Structured output
Thinking
Function calling
Document understanding
Image understanding
Video understanding
Audio understanding
Code execution
URL context
Grounding with Google Search
Guides
Prompt engineering
Live API
Context caching
Files API
Token counting
Fine-tuning
Embeddings
Safety
Resources
Migrate to Gen AI SDK
Release notes
API troubleshooting
Open-Source Frameworks
AI Studio
Google Cloud Platform
Policies
Terms of service
Available regions
Additional usage polices
Home
Gemini API
Models
Was this helpful?
Send feedback
Gemini models
On this page
Model variants
Gemini 2.5 Flash Preview 05-20
Gemini 2.5 Flash Native Audio
Gemini 2.5 Flash Preview Text-to-Speech
Gemini 2.5 Pro Preview
Gemini 2.5 Pro Preview Text-to-Speech
Gemini 2.0 Flash
Gemini 2.0 Flash Preview Image Generation

2.5 Pro experiment

Our most powerful thinking model with maximum response accuracy and state-of-the-art performance

Input audio, images, video, and text, get text responses
Tackle difficult problems, analyze large databases, and more
Best for complex coding, reasoning, and multimodal understanding

2.5 Flash experiment

Our best model in terms of price-performance, offering well-rounded capabilities.

Input audio, images, video, and text, and get text responses
Model thinks as needed; or, you can configure a thinking budget
Best for low latency, high volume tasks that require thinking

2.0 Flash spark

Our newest multimodal model, with next generation features and improved capabilities

Input audio, images, video, and text, get text responses
Generate code and images, extract data, analyze files, generate graphs, and more
Low latency, enhanced performance, built to power agentic experiences
Model variants

The Gemini API offers different models that are optimized for specific use cases. Here's a brief overview of Gemini variants that are available:

Model variant	Input(s)	Output	Optimized for
Gemini 2.5 Flash Preview 05-20
gemini-2.5-flash-preview-05-20	Audio, images, videos, and text	Text	Adaptive thinking, cost efficiency
Gemini 2.5 Flash Native Audio
gemini-2.5-flash-preview-native-audio-dialog &
gemini-2.5-flash-exp-native-audio-thinking-dialog	Audio, videos, and text	Text and audio, interleaved	High quality, natural conversational audio outputs, with or without thinking
Gemini 2.5 Flash Preview TTS
gemini-2.5-flash-preview-tts	Text	Audio	Low latency, controllable, single- and multi-speaker text-to-speech audio generation
Gemini 2.5 Pro Preview
gemini-2.5-pro-preview-06-05	Audio, images, videos, and text	Text	Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more
Gemini 2.5 Pro Preview TTS
gemini-2.5-pro-preview-tts	Text	Audio	Low latency, controllable, single- and multi-speaker text-to-speech audio generation
Gemini 2.0 Flash
gemini-2.0-flash	Audio, images, videos, and text	Text	Next generation features, speed, thinking, and realtime streaming.
Gemini 2.0 Flash Preview Image Generation
gemini-2.0-flash-preview-image-generation	Audio, images, videos, and text	Text, images	Conversational image generation and editing
Gemini 2.0 Flash-Lite
gemini-2.0-flash-lite	Audio, images, videos, and text	Text	Cost efficiency and low latency
Gemini 1.5 Flash
gemini-1.5-flash	Audio, images, videos, and text	Text	Fast and versatile performance across a diverse variety of tasks
Gemini 1.5 Flash-8B
gemini-1.5-flash-8b	Audio, images, videos, and text	Text	High volume and lower intelligence tasks
Gemini 1.5 Pro
gemini-1.5-pro	Audio, images, videos, and text	Text	Complex reasoning tasks requiring more intelligence
Gemini Embedding
gemini-embedding-exp	Text	Text embeddings	Measuring the relatedness of text strings
Imagen 3
imagen-3.0-generate-002	Text	Images	Our most advanced image generation model
Veo 2
veo-2.0-generate-001	Text, images	Video	High quality video generation
Gemini 2.0 Flash Live
gemini-2.0-flash-live-001	Audio, video, and text	Text, audio	Low-latency bidirectional voice and video interactions

You can view the rate limits for each model on the rate limits page.

Gemini 2.5 Flash Preview 05-20
Gemini 2.5 Flash Native Audio
Gemini 2.5 Flash Preview Text-to-Speech
Gemini 2.5 Pro Preview
Gemini 2.5 Pro Preview Text-to-Speech
Gemini 2.0 Flash
Gemini 2.0 Flash Preview Image Generation
Gemini 2.0 Flash-Lite
Gemini 1.5 Flash
Gemini 1.5 Flash-8B
Gemini 1.5 Pro
Imagen 3
Veo 2
Gemini 2.0 Flash Live
Gemini Embedding Experimental
Text Embedding and Embedding
AQA

See the examples to explore the capabilities of these model variations.

[*] A token is equivalent to about 4 characters for Gemini models. 100 tokens are about 60-80 English words.

Model version name patterns

Gemini models are available in either stable, preview, or experimental versions. In your code, you can use one of the following model name formats to specify which model and version you want to use.

Latest stable

Points to the most recent stable version released for the specified model generation and variation.

To specify the latest stable version, use the following pattern: <model>-<generation>-<variation>. For example, gemini-2.0-flash.

Stable

Points to a specific stable model. Stable models usually don't change. Most production apps should use a specific stable model.

To specify a stable version, use the following pattern: <model>-<generation>-<variation>-<version>. For example, gemini-2.0-flash-001.

Preview

Points to a preview model which may not be suitable for production use, come with more restrictive rate limits, but may have billing enabled.

To specify a preview version, use the following pattern: <model>-<generation>-<variation>-<version>. For example, gemini-2.5-pro-preview-06-05.

Experimental

Points to an experimental model which may not be suitable for production use and come with more restrictive rate limits. We release experimental models to gather feedback and get our latest updates into the hands of developers quickly.

To specify an experimental version, use the following pattern: <model>-<generation>-<variation>-<version>. For example, gemini-2.0-pro-exp-02-05.

Experimental models

In addition to stable models, the Gemini API offers experimental models which may not be suitable for production use and come with more restrictive rate limits.

We release experimental models to gather feedback, get our latest updates into the hands of developers quickly, and highlight the pace of innovation happening at Google. What we learn from experimental launches informs how we release models more widely. An experimental model can be swapped for another without prior notice. We don't guarantee that an experimental model will become a stable model in the future.

Previous experimental models

As new versions or stable releases become available, we remove and replace experimental models. You can find the previous experimental models we released in the following section along with the replacement version:

Model code	Base model	Replacement version
gemini-2.0-flash-exp-image-generation	Gemini 2.0 Flash	gemini-2.0-flash-preview-image-generation
gemini-2.5-pro-preview-03-25	Gemini 2.5 Pro Preview	gemini-2.5-pro-preview-05-06
gemini-2.0-flash-thinking-exp-01-21	Gemini 2.5 Flash	gemini-2.5-flash-preview-04-17
gemini-2.0-pro-exp-02-05	Gemini 2.0 Pro Experimental	gemini-2.5-pro-preview-03-25
gemini-2.0-flash-exp	Gemini 2.0 Flash	gemini-2.0-flash
gemini-exp-1206	Gemini 2.0 Pro	gemini-2.0-pro-exp-02-05
gemini-2.0-flash-thinking-exp-1219	Gemini 2.0 Flash Thinking	gemini-2.0-flash-thinking-exp-01-21
gemini-exp-1121	Gemini	gemini-exp-1206
gemini-exp-1114	Gemini	gemini-exp-1206
gemini-1.5-pro-exp-0827	Gemini 1.5 Pro	gemini-exp-1206
gemini-1.5-pro-exp-0801	Gemini 1.5 Pro	gemini-exp-1206
gemini-1.5-flash-8b-exp-0924	Gemini 1.5 Flash-8B	gemini-1.5-flash-8b
gemini-1.5-flash-8b-exp-0827	Gemini 1.5 Flash-8B	gemini-1.5-flash-8b
Supported languages

Gemini models are trained to work with the following languages:

Arabic (ar)
Bengali (bn)
Bulgarian (bg)
Chinese simplified and traditional (zh)
Croatian (hr)
Czech (cs)
Danish (da)
Dutch (nl)
English (en)
Estonian (et)
Finnish (fi)
French (fr)
German (de)
Greek (el)
Hebrew (iw)
Hindi (hi)
Hungarian (hu)
Indonesian (id)
Italian (it)
Japanese (ja)
Korean (ko)
Latvian (lv)
Lithuanian (lt)
Norwegian (no)
Polish (pl)
Portuguese (pt)
Romanian (ro)
Russian (ru)
Serbian (sr)
Slovak (sk)
Slovenian (sl)
Spanish (es)
Swahili (sw)
Swedish (sv)
Thai (th)
Turkish (tr)
Ukrainian (uk)
Vietnamese (vi)
Was this helpful?
Send feedback

Except as otherwise noted, the content of this page is licensed under the Creative Commons Attribution 4.0 License, and code samples are licensed under the Apache 2.0 License. For details, see the Google Developers Site Policies. Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-06-09 UTC.

Terms
Privacy
The new page has loaded..

End of content from https://ai.google.dev/gemini-api/docs/models
