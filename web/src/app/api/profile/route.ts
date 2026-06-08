import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const rootPath = path.resolve(process.cwd(), '..');
const profilePath = path.join(rootPath, 'config', 'profile.yml');

export async function GET() {
  try {
    if (!fs.existsSync(profilePath)) {
      return NextResponse.json({ error: 'profile.yml not found' }, { status: 404 });
    }
    const fileContent = fs.readFileSync(profilePath, 'utf8');
    const profile = yaml.load(fileContent);
    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const yamlString = yaml.dump(body, { noRefs: true, lineWidth: 120 });
    fs.writeFileSync(profilePath, yamlString, 'utf8');
    return NextResponse.json({ success: true, profile: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
