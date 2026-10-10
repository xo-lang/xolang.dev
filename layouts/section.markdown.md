# {{ .Title }}

{{ .RenderShortcodes }}
{{- if eq .Path "/docs/tour" }}
{{ range $i, $p := .RegularPages }}
{{ add $i 1 }}. [{{ $p.LinkTitle }}]({{ (.OutputFormats.Get "markdown").Permalink }}): {{ $p.Description }}
{{- end }}
{{- end }}
