# Deployment

The project is configured for a Vercel frontend, a Render API, MongoDB Atlas,
and private resume storage in Cloudinary.

## 1. Prepare the services

- Create a MongoDB Atlas database and a database user. Configure Atlas network
  access for the Render service's outbound IP addresses.
- Create a Cloudinary account. Resume files are uploaded as authenticated raw
  assets and are only downloaded through the authenticated API.
- Push this project to a GitHub repository. Do not commit `.env` files,
  credentials, or files under `server/uploads/resumes`.

## 2. Deploy the API to Render

- In Render, create a Blueprint from the repository root; Render reads
  `render.yaml` and creates the `student-placement-api` web service.
- Set the service's `MONGO_URI` to the Atlas connection string.
- Set `CLIENT_ORIGIN` temporarily to `http://localhost:5173`; replace it with
  the deployed Vercel origin after deploying the client.
- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET` using Cloudinary's dashboard.
- Render generates `JWT_SECRET`. Keep all credentials in Render's environment
  settings; never put production values in frontend variables or source files.
- Confirm the service health check succeeds at `/health`.

## 3. Deploy the client to Vercel

- Import the repository in Vercel and set the project root directory to `client`.
- Use `npm run build` as the build command and `dist` as the output directory.
- Set `VITE_API_URL` to the Render API origin followed by `/api`, for example
  `https://student-placement-api.onrender.com/api`.
- Deploy the client, then set the Render `CLIENT_ORIGIN` to the Vercel origin
  (for example `https://your-project.vercel.app`) and redeploy/restart the API.

## 4. Verify

- Open the Vercel URL and register a test student and company account.
- Sign in as the company, publish a drive, and apply as the student with a PDF
  or DOCX resume.
- Confirm the application appears in the company portal, the company can
  download its resume, and only the company can update its application status.
- Remove test accounts/applications and review Cloudinary's stored test asset.

Resume contents and CGPA/backlog values are screened as workflow aids; the
company makes the final application-stage decision.
