$(document).ready(function() {

	
/* ------------------------------------------------------------------ 
|	Cria os Botões de Ver,Editar e Excluir
------------------------------------------------------------------*/

var	actions_buttons = '<a data-toggle="modal" data-target="#edit" class="editar"><i class="fa fa-edit" data-toggle="tooltip" data-placement="left" title="'+pt_br.tooltip_editar+'"></i></a> ';
	actions_buttons += '<a href="#deletar" class="del"><i class="fa fa-trash" data-toggle="tooltip" data-placement="left" title="'+pt_br.tooltip_deletar+'"></i></a>';
				    					 
/* ------------------------------------------------------------------ 
|	DataTables Plugin
------------------------------------------------------------------*/
var dataTable = $('#tabela_dados').DataTable( {
		"lengthMenu": [[10,25,50, -1], [10,25,50, "Todos"]],// modifica qtd de resultados por pagina
		"aaSorting": [[ 0, "asc" ]],// indice da coluna para a ordenação no init da DataTable
		"scrollX": true,
		"oLanguage": {
			"sSearch": pt_br.sSearch,
			"sLengthMenu": '_MENU_',
			"sZeroRecords": pt_br.sZeroRecords,
			"sInfo": pt_br.sInfo,
			"sInfoEmpty":pt_br.sInfoEmpty,
			"sInfoFiltered":pt_br.sInfoFiltered,
			"sProcessing":pt_br.sProcessing

		},
		"bProcessing": true,// mostra o icone de processando...
		"bServerSide": true,// faz com que o processamento seja do lado do servidor
		// Ajax propriedades
		"ajax":{
			"url":pt_br.absolute_url+"/panel-control/adicionais/pesquisa",
			"type":"POST"
		},
		// Colunas propriedades
		"columns": [
			{
				'width':'12.5%', 
				"name": "adicionais.cod" 
			},
			{ "name": "produtos.nome" },
			{ "name": "categorias.nome" },
			{ "name": "valor","data":5 },
		    {
		    	'width':'12.5%', 
		    	"data":null,
		    	"orderable":      false,
		    	"defaultContent":actions_buttons
		    }
		  ]
});


 // Array de ids das linhas que irão mostrar os detalhes
    var detailRows = [];
 /* ------------------------------------------------------------------ 
|	Manipulador para quando o usuario clicar no view da tabela
------------------------------------------------------------------*/
    $('#tabela_dados tbody').off("click",".view").on( 'click', '.view', function () {

        var tr = $(this).closest('tr');
        var row = dataTable.row( tr );
        var idx = $.inArray( tr.attr('id'), detailRows );
 		var fonticon = $(this).children('i');
 		
        if ( row.child.isShown() ) {
            tr.removeClass( 'details' );
            fonticon.removeClass('fa fa-eye-slash');
           	fonticon.addClass('fa fa-eye');
            row.child.hide(200);
 
            // Remove from the 'open' array
            detailRows.splice( idx, 1 );
        }
        else {
            tr.addClass( 'details' );
            fonticon.removeClass('fa fa-eye');
            fonticon.addClass('fa fa-eye-slash');
            
           var codigo = parseInt(tr.children("td:eq(0)").text(),10);

            $.ajax({

		    type: "GET",
		    url : pt_br.absolute_url+"/panel-control/adicionais/ver",
		    data : {codigo:codigo},
		    dataType: 'json'
		    }).done(function(res){
		    	row.child(format(res[0])).show(200);
 
	            // Add to the 'open' array
	            if ( idx === -1 ) {
	                detailRows.push( tr.attr('id') );
	            }

		    });
            
        }
    });
 
    // On each draw, loop over the `detailRows` array and show any child rows
    dataTable.on( 'draw', function () {
        $.each( detailRows, function ( i, id ) {
            $('#'+id+' td.details-control').trigger( 'click' );
        } );
    } );
/* ------------------------------------------------------------------ 
|	Preenche o select com os produtos cadastradas
------------------------------------------------------------------*/
$("#edit_produtos").getProdutosSelect();
/* ------------------------------------------------------------------ 
|	Preenche o select com as categorias cadastradas
------------------------------------------------------------------*/
$("#edit_categorias").getCategoriasSelect();
/*------------------------------------------------------------------------
|	Carrega informações via ajax para edição
|------------------------------------------------------------------------*/
$(document).off("click",".editar").on("click",".editar",function(){

	$("#editar").modal("show");
	var codigo = parseInt($(this).parents("tr").children("td:eq(0)").text(),10);

	$.ajax({

    type: "GET",
    url : pt_br.absolute_url+"/panel-control/adicionais/editar",
    data : {codigo:codigo},
    dataType: 'json'
    }).done(function(res){
    	$("#edit_cod").val(res[0].cod);
    	$("#edit_produtos").val(res[0].cod_produto);
    	$("#edit_categorias").val(res[0].cod_categoria);
    	$("#edit_valor").val(parseFloat(res[0].valor).toFixed(2));
    	$("#titulo_modal").html("<b style='color:#d15e5e;'>"+$("#produtos option:selected").text().toUpperCase()+"</b>");
    	
    });

});

/*------------------------------------------------------------------------
|	Função de salvar edição
|------------------------------------------------------------------------*/
$("#salvar_edicao").off("click").on("click",function(){

	if($("#edit_produtos").val() == "" || $("#edit_categorias").val() == "")
	{
		alertErro(pt_br.campos_vazios);
		return false;
	}

	
	var dados = new FormData(document.querySelector("#edicao"));
	
	$.ajax({
		type: "POST",
        contentType: false,
        url : pt_br.absolute_url+"/panel-control/adicionais/editar",
        enctype: 'multipart/form-data',
        data : dados,
        processData:false
    }).done(function(res){
    	
    	if(parseInt(res,10) == 1)
    	{
    		$("#editar").modal("hide");
    		clearFormulario();
    		dataTable.ajax.reload();
    		alertSucesso(pt_br.msg_edicao_sucesso);

    	}
    	else if(parseInt(res,10) == 0)
    	{
    		alertErro(pt_br.msg_erro);
    	}
    	else if(parseInt(res,10) == 2)
    	{
    		alertErro(pt_br.msg_erro_existe);
    	}

    });
});
/*------------------------------------------------------------------------
|	FUNÇÃO DE CONFIRMAÇÃO DE EXCLUSÃO
|------------------------------------------------------------------------*/

$(document).off("click",".del").on("click",".del",function(){

	if(!confirm(pt_br.cofirmacao_deletar))
		return false;

	var id = parseInt($(this).parents("tr").children("td:eq(0)").text(),10);
	$.ajax({
		type: "GET",
	    url: pt_br.absolute_url+"/panel-control/adicionais/deletar",
	    data: {id:id}
    }).done(function(res){
    	
    	if(parseInt(res,10) == 1)
    	{
    		dataTable.ajax.reload();
    		alertSucesso(pt_br.msg_exclusao_sucesso);
    	}
    	else if(parseInt(res,10) == 0)
    	{
    		alertErro(pt_br.msg_erro);
    	}

    });

});

});
// Função que formata os dados para mostrar no detalhes da tabela
function format(f){

	string = '';
	string += "<b>"+pt_br.format_field_adicional+"</b>"+' '+f.adicional+'<br>';
	string += "<b>"+pt_br.format_field_categoria+"</b>"+' '+f.categoria+'<br>';
	return string;

}

function clearFormulario()
{
	$("#edicao input").each(function(){
		$(this).val("");
	});
	
}
