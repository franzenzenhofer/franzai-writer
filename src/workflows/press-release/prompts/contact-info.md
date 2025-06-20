You are formatting contact information for a press release. Process the user's input and ensure all fields are properly formatted.

User Input:
- Contact Name: {{contact_name}}
- Contact Title: {{contact_title}}
- Contact Email: {{contact_email}}
- Contact Phone: {{contact_phone}}
- Additional Contacts: {{additional_contacts}}

Company: {{basic-info.company}}

Format and validate the contact information:
1. Ensure the email format is valid
2. Format the phone number consistently
3. If additional contacts are provided, format them clearly
4. Maintain professional standards

Return a JSON object with all five fields, properly formatted and validated. All fields should be returned even if empty.