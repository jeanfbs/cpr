@extends('template')

@section('title')   {{trans('geral.titulo_pedidos')}}    @stop
@section('content')
<link rel="stylesheet" type="text/css" href="{{url('css/file.css')}}">
<link rel="stylesheet" type="text/css" href="{{url('plugins/select2/select2.css')}}">
<link rel="stylesheet" type="text/css" href="{{url('plugins/fancybox/jquery.fancybox.css')}}">
<!--Start Breadcrumb-->
<div class="row">
	<div id="breadcrumb" class="col-xs-12">
		<ol class="breadcrumb">
			<li><a href="{{url('panel-control/dashboard')}}">{{trans('geral.breadcrumb_home')}}</a></li>
			<li><a href="#">{{trans('geral.titulo_pedidos')}}</a></li>
			<li><a href="#" id="view_name">{{trans('geral.tab_pesquisar')}}</a></li>
		</ol>
	</div>
</div>
<!--End Breadcrumb-->
<div class="col-xs-12 col-sm-12">
		<div class="box">
			<div class="box-header">
				<div class="box-name">
					<i class="fa fa-paper-plane"></i>
					<span>{{trans('geral.titulo_pedidos')}}</span>
				</div>
				<div class="box-icons pull-right">
					<a class="collapse-link">
						<i class="fa fa-chevron-up"></i>
					</a>
					<a class="expand-link">
						<i class="fa fa-expand"></i>
					</a>
					<a href="{{url('panel-control/ajuda#pedidos')}}">
						<i class="fa fa-question-circle"></i>
					</a>
				</div>
				<div class="no-move"></div>
			</div>
			<div class="box-content">
				<div id="tabs">
					<ul>
						<li><a href="{{url('panel-control/pedidos/cadastro')}}">{{trans('geral.tab_cadastro')}}</a></li>
						<li><a href="{{url('panel-control/pedidos/pedidosenviados')}}">{{trans('geral.tab_pesquisar')}}</a></li>
					</ul>
					<div id="tabs-2">
						
					</div>
				</div>
			</div>
		</div>
	</div>

<div style="height: 40px;"></div>
<script src="{{url('plugins/fancybox/jquery.fancybox.js')}}" type="text/javascript" charset="utf-8"></script>
<script src="{{url('plugins/select2/select2.min.js')}}" type="text/javascript" charset="utf-8"></script>
<script src="{{url('js/utilidades.js')}}" type="text/javascript" charset="utf-8"></script>
<script>
$(document).ready(function() {

	$("#tabs").tabs({active: 1});
	$(document).popover({selector:'*[data-toggle="popover"]'});
	$(document).submit(function(){return false;});
	$( "#tabs" ).tabs({
		beforeLoad: function( event, ui ) {
			title = $(ui.tab).text();
			$("#view_name").text(title);

			ui.jqXHR.fail(function() {
				ui.panel.html(
					"Ocorreu um erro ao tentar carregar conteúdo" );
			});
		}
	});
	/*------------------------------------------------------------------------
	|	FancyBox Plugin
	|------------------------------------------------------------------------*/
	$('.fancybox').fancybox({
			openEffect	: 'none',
			closeEffect	: 'none'
	});

WinMove();
/*------------------------------------------------------------------------
|	A função abaixo verifica a cada vez que o 
|	documento HTML e carregado se foi enviado
|	uma mensagem do servidor de erro ou de
|	alguma operação feita
|------------------------------------------------------------------------*/
		setTimeout(function(){
			alerta();
		},1000);

});
</script>
@stop