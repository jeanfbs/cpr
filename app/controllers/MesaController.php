<?php 
/**
*	TECHMOB - Empresa Júnior da Faculdade de Computação - UFU 
*	
*	Controlador Mesa
*
*	@author: Jean Fabrício <jeanufu21@gmail.com>
*	@since 12/02/2016
*	
*/
class MesaController extends BaseController{


	public function getIndex(){

		Session::put('flag',14);
		
		return View::make("mesas.mesas");
	}
	
	public function getCadastro(){

		return View::make("mesas.cadastro");
	}
	/*******************************************
	*  Metodo que cadastra as informações de 
	*  mesas via Ajax
	********************************************/
	public function postCadastro()
	{
		$dados = Input::all();
		$mesa = new MesasModel($dados);
		$status = $mesa->save();

		if($status)
			return 1;
		else
			return 0;
	}
	/*******************************************
	*  Ação que retorna a View de Pesquisa para 
	*  Tab.
	********************************************/
	public function getPesquisa()
	{
		return View::make("mesas.pesquisa");
	}

	/*******************************************
	*  Ação que faz a busca dos dados via Ajax utilizando
	*  o Plugin DataTables
	********************************************/
	public function postPesquisa()
	{
		$dados = Input::all();

		if(isset($dados["columns"]))
			$columns = $dados["columns"];
		if(isset($dados["order"]))
		{
			$order = $dados["order"];
			$order = $order[0];
			$orderIndex = intval($order["column"]);
		}

		if(isset($dados["search"]))
			$search = $dados["search"];
			$limit = intval($dados["length"]);
			$start = intval($dados["start"]);

		$recordsTotal = count(MesasModel::get());

		if($limit == -1)
			$limit = $recordsTotal;
		$mesas = MesasModel::
		select(DB::raw('SQL_CALC_FOUND_ROWS *'))
		->where("cod",$search["value"])
		->orWhere("nome","LIKE","%".$search["value"]."%")
		->orderBy($columns[$orderIndex]["name"],$order["dir"])
		->take($limit)
		->skip($start)
		->get();
		
		
		$recordsFiltered = DB::select( DB::raw("SELECT FOUND_ROWS() AS total;") );
		$recordsFiltered = $recordsFiltered[0];
		$recordsFiltered = intval($recordsFiltered->total);
		$json = [];
		$json["draw"] = intval($dados["draw"]);
		$json["recordsTotal"] = $recordsTotal;
		$json["recordsFiltered"] = $recordsFiltered;
		$json["aaData"] = array();
		foreach ($mesas->toArray() as $key => $value) 
		{
			array_push($json["aaData"], array_values($value));
		}
		
		return json_encode($json);
	}

	/*******************************************
	*  Ação de solicitação Ajax que auto preenche
	*  os dados para edição
	********************************************/
	public function getEditar()
	{
		$codigo = Input::get('codigo');
		$mesa = MesasModel::
		where('cod', $codigo)
		->get();
		return json_encode($mesa);
	}
	/*******************************************
	*  Ação que faz a edição dos dados
	********************************************/
	public function postEditar()
	{

		$dados = Input::all();
		unset($dados["_token"]);

		$codigo = $dados["cod"];
		
		$result = DB::table('mesas')
        ->where('cod', $codigo)
        ->update($dados);
        
        if($result)
			return 1;
		else
			return 0;
	}

	/*******************************************
	*  Ação que faz a exclusão dos dados
	********************************************/
	public function getDeletar()
	{
		$id = Input::get("id");
		
		// $isForeign = count(DB::table('pedidos')->where('cod_cliente',$id)->get());

		// if($isForeign > 0)
		// {
		// 	return 2;
		// }		
		DB::table('mesas')->where('cod',$id)->delete();
		return 1;
	}

	/*******************************************
	*  Ação que faz a busca dos dados
	********************************************/
	public function getListar()
	{
		$mesas = MesasModel::
		orderBy("nome","asc")
		->get();

		return json_encode($mesas);
		
	}

}