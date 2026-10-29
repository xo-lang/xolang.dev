# {{ .Title }}

Xo is at v{{ hugo.Data.release.version }} and still experimental. A stage is done when the test suite covers it; the project owner decides when Xo makes the 1.0 compatibility promise. There are no dates.

## The road to 1.0, and past it
{{ range hugo.Data.roadmap.milestones }}
- **{{ .title | plainify }}** ({{ .status }}): {{ .text | plainify }}
{{- end }}

## The plan, in order
{{ range hugo.Data.roadmap.plan }}
- **{{ .title | plainify }}** ({{ .status }}): {{ .text | plainify }}
{{- end }}
