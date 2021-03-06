<link rel="stylesheet" type="text/css" href="{{url('plugins/datatables/css/dataTables.bootstrap.min.css')}}">
<style type="text/css" media="screen">
	table{width:100%!important;}
	.dataTables_scrollHeadInner{width: 100%!important;}
</style>
<div class="row">
	
	<div class="col-xs-12">
		<div class="box-content no-padding">
			<table class="table table-bordered table-striped table-hover" id="tabela_dados">
				<thead>
					<tr class="active">
						<th>{{trans('geral.codigo')}}</th>
						<th>{{trans('geral.adicional')}}</th>
						<th>{{trans('geral.categoria')}}</th>
						<th>{{trans('geral.preco')}}</th>
						<th>{{trans('geral.acao')}}</th>
					</tr>
				</thead>
				<tbody>
				</tbody>
				
			</table>
		</div>
	</div>	
</div>

<!-- Modal -->
<div class="modal fade" id="editar" tabindex="-1" role="dialog" aria-labelledby="editar">
  <div class="modal-dialog devoops-modal" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">{{trans('geral.titulo_modal')}} <span id="titulo_modal"><span></h4>
      </div>
      <div class="modal-body">
        {{Form::open(array('class' => 'form-horizontal ','id' => 'edicao','files' => true))}}
        <input type="hidden" id="edit_cod" name="cod">
		<div class="form-group">
			<label class="col-sm-2 control-label">*{{trans('geral.categoria')}}</label>
			<div class="col-sm-5">
				<select class="form-control" name="cod_categoria" id="edit_categorias">
				  <option value=""></option>
				</select>
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-2 control-label">*{{trans('geral.produto')}}</label>
			<div class="col-sm-5">
				<select class="form-control" name="cod_produto" id="edit_produtos">
				  <option value=""></option>
				</select>
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-2 control-label">*{{trans('geral.preco')}}</label>
			<div class="col-sm-4">
				<input type="text" class="form-control required float" name="valor" id="edit_valor" placeholder="Ex: 2.50" title="{{trans('geral.preco')}}">
			</div>
		</div>
	{{Form::close()}}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">{{trans('geral.button_cancelar')}}</button>
        <button type="button" class="btn btn-primary" id="salvar_edicao">{{trans('geral.button_salvar')}}</button>
      </div>
    </div>
  </div>
</div>
<script src="{{url('plugins/datatables/js/jquery.dataTables.js')}}"></script>
<script src="{{url('plugins/datatables/js/dataTables.bootstrap.min.js')}}"></script>
<script src="{{url('js/cardapio/adicionais/pesquisa.js')}}"></script>

