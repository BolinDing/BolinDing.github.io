function genPaperHtml(papertitle, paperlink, authors, booktitle, papernote = '') {
	var textWCite = '<p class="paper" id="_paperid">\
						<papertitle>\
							<a href="papers/_paperlink.pdf">\
								_papertitle\
							</a>\
						</papertitle><br>\
						<authors>\
							_authors\
						</authors><br>\
						<booktitle>\
							_booktitle\
						</booktitle>\
						_papernote\
						<a id = "_citelink"></a>\
					</p>';

	textWCite = textWCite.replace('_papertitle', papertitle);
	textWCite = textWCite.replace('_paperlink', paperlink);
	textWCite = textWCite.replace('_paperid', paperlink);
	textWCite = textWCite.replace('_authors', authors);
	textWCite = textWCite.replace('_booktitle', booktitle);

	if (papernote !== '') {
		textWCite = textWCite.replace('_papernote', '<papernote>(' + papernote + ')</papernote>');
	}
	else {
		textWCite = textWCite.replace('_papernote', '');
	}

	textWCite = textWCite.replace('_citelink', paperlink + '_cites');
	
	document.write(textWCite);
}

function showText(divId, text) {
   console.log(divId);
   console.log(text);
   $(divId).text(text);
}

function runPHP(divId, phpUrl) {
   console.log(divId);
   console.log(phpUrl);
   $(divId).load(phpUrl);
}

function genCites(papertitle, paperlink, otherKeywords = 'Bolin Ding') {
   $('#'+paperlink+'_cites').load('citation.php?q='+encodeURI(papertitle + ' ' + otherKeywords));
}

function genEmbeddedPaperHtml(papertitle, paperlink, authors, booktitle, papernote = '', withCite = true) {
    genPaperHtml(papertitle, paperlink, authors, booktitle, papernote);
    if (withCite) {
        genCites(papertitle, paperlink);
    }
}
