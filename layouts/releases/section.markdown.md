# {{ .Title }}

{{ .RenderShortcodes }}
{{ range .Pages.ByDate.Reverse }}
- [{{ .LinkTitle }}]({{ (.OutputFormats.Get "markdown").Permalink }}) (released {{ .Date.Format "2006-01-02" }}): {{ .Description }}
{{- end }}
{{ with .Params.earlier }}
## Earlier versions

{{ . }}
{{ end }}
