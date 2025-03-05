import React, { useState, useEffect } from 'react';
import { Editor } from "@tinymce/tinymce-react";
import APIService from "../api/APIService";
import { Button } from 'react-bootstrap';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;
export default function TestPage() {
  const [htmlContent, setHtmlContent] = useState('');

  const onEditorChange = (e) => {
    setHtmlContent(e);
  }

  const saveTestEmailTemplate = (e) => {
    let params = {};
    params["file_data"] = htmlContent.replaceAll('&lt;','<').replaceAll('&gt;','>');
    params["template"] = "test-assignuseremail";
    APIService.saveTestEmailTemplate(params)
      .then((response) => {
        if (response.data?.status) {
          console.log(response.data);
        }
      });
  }

  useEffect(() => {
    let params = "?template=test-assignuseremail";
    APIService.getTestEmailTemplate(params)
      .then((response) => {
        if (response.data?.status) {
          //console.log(response.data?.data);
          setHtmlContent(response.data?.data);
        }
      });
  }, []);

  return (
    <>
    <div>
    <p>Contact Firstname<span className="pull-right"><a href="#" className="add_merge_field">{`<%= task_data.start_date_new %>`}</a></span></p>
    </div>
      <Editor
        apiKey={REACT_APP_TINYMCE_APIKEY}
        value={htmlContent}
        init={{
          branding: false,
          browser_spellcheck: true,
          inline_styles: true,
          verify_html: false,
          cleanup: false,
          valid_elements: '+*[*]',
          valid_children: "+body[style], +style[type]",
          apply_source_formatting: false,
          remove_script_host: false,
          removed_menuitems: 'newdocument restoredraft',
          forced_root_block: false,
          autosave_restore_when_empty: false,
          fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
          height: 400,
          menubar: true,
          //menubar: 'file edit insert view format table tools help',
          plugins:
            "autosave print preview paste searchreplace autolink directionality visualblocks visualchars code fullscreen image link media save template codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount textpattern",
          toolbar:
            "fontselect fontsizeselect formatselect | forecolor backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | image link media | numlist bullist outdent indent | restoredraft | removeformat",
          image_advtab: true,
          automatic_uploads: true,
          images_upload_url: '/upload',
          file_picker_types: 'image',
          file_picker_callback: function (cb, value, meta) {
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = function () {
              var file = this.files[0];

              var reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = function () {
                var id = 'blobid' + (new Date()).getTime();
                var blobCache = Editor.activeEditor.editorUpload.blobCache;
                var base64 = reader.result.split(',')[1];
                var blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);
                cb(blobInfo.blobUri(), { title: file.name });
              };
            };
            input.click();
          }
        }}
        onEditorChange={onEditorChange}
      />
      <Button variant="primary" size="md" type="button" onClick={saveTestEmailTemplate} className='mt-2'>Save</Button>
    </>
  );
}
